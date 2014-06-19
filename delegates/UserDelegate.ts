import moment                                                           = require('moment');
import validator                                                        = require('validator');
import q                                                                = require('q');
import _                                                                = require('underscore');
import fs                                                               = require('fs');
import passport                                                         = require('passport');
import crypto                                                           = require('crypto');
import BaseDaoDelegate                                                  = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                                    = require('../delegates/MysqlDelegate');
import UserProfileDelegate                                              = require('../delegates/UserProfileDelegate');
import ImageDelegate                                                    = require('../delegates/ImageDelegate');
import UserPhoneDelegate                                                = require('../delegates/UserPhoneDelegate');
import ScheduleDelegate                                                 = require('../delegates/ScheduleDelegate');
import ScheduleRuleDelegate                                             = require('../delegates/ScheduleRuleDelegate');
import PricingSchemeDelegate                                            = require('../delegates/PricingSchemeDelegate');
import User                                                             = require('../models/User');
import UserProfile                                                      = require('../models/UserProfile');
import PricingScheme                                                    = require('../models/PricingScheme');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import ImageSize                                                        = require('../enums/ImageSize');
import Config                                                           = require('../common/Config');
import Utils                                                            = require('../common/Utils');

/*
 Delegate class for User operations
 */
class UserDelegate extends BaseDaoDelegate
{
    private imageDelegate = new ImageDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private scheduleRuleDelegate = new ScheduleRuleDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    constructor() { super(User); }

    create(object:any, dbTransaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        if (!Utils.isNullOrEmpty(object) && object.hasOwnProperty(User.PASSWORD))
            object[User.PASSWORD] = this.computePasswordHash(object[User.EMAIL], object[User.PASSWORD]);

        var self = this;

        return super.create(object, dbTransaction)
            .then(
            function userCreated(user:User)
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setUserId(user.getId());

                return [user, self.userProfileDelegate.create(userProfile, dbTransaction), self.scheduleRuleDelegate.createDefaultRules(user.getId(), dbTransaction)];
            })
            .spread(
            function userProfileCreated(...args)
            {
                return args[0];
            });
    }

    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var superUpdate = super.update.bind(this);
        delete newValues[User.ID];
        delete newValues[User.EMAIL];

        if (newValues.hasOwnProperty(User.PASSWORD) && !Utils.isNullOrEmpty(newValues[User.PASSWORD]))
        {
            return this.find(criteria)
                .then(
                function userFetched(user:User)
                {
                    user.setPassword(self.computePasswordHash(user.getEmail(), newValues[User.PASSWORD]));
                    return superUpdate(criteria, user, transaction);
                });
        }

        return super.update(criteria, newValues);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return self.userProfileDelegate.search({'user_id': result.getId()});

            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER:
                var IntegrationMemberDelegate:any = require('../delegates/IntegrationMemberDelegate');
                var integrationMemberDelegate = new IntegrationMemberDelegate();
                return integrationMemberDelegate.searchByUser(result.getId());

            case IncludeFlag.INCLUDE_PRICING_SCHEMES:
                return self.pricingSchemeDelegate.search(Utils.createSimpleObject(PricingScheme.USER_ID, result.getId()));

            case IncludeFlag.INCLUDE_USER_PROFILE:
                return self.userProfileDelegate.search({'user_id': _.uniq(_.pluck(result, User.ID))});

            case IncludeFlag.INCLUDE_SCHEDULES:
                // Return schedules for next 4 months
                var scheduleStartTime = moment().hours(0).valueOf();
                var scheduleEndTime = moment().add({months: 4}).valueOf();

                if (Utils.getObjectType(result) != 'Array')
                    return self.scheduleDelegate.getSchedulesForUser(result.getId(), scheduleStartTime, scheduleEndTime)
            /*
             else
             return self.scheduleDelegate.getSchedulesForExpert(_.uniq(_.pluck(result, IntegrationMember.ID)), scheduleStartTime, scheduleEndTime);
             */

            case IncludeFlag.INCLUDE_SCHEDULE_RULES:
                return self.scheduleRuleDelegate.getRulesByUser(result[0][User.ID]);
        }
        return super.getIncludeHandler(include, result);
    }

    processProfileImage(userId:number, tempImagePath:string):q.Promise<any>
    {
        var self = this;
        var imageBasePath:string = Config.get(Config.PROFILE_IMAGE_PATH) + userId;
        var newImagePath:string = imageBasePath;

        return self.imageDelegate.move(tempImagePath, newImagePath)
            .fail(
            function imageMoveFailed(err)
            {
                self.logger.error('Failed renaming file %s to %s. Error: %s', tempImagePath, newImagePath, err);
                throw('An error occurred while uploading your image');
            });

        /*
         var sizes = [ImageSize.SMALL];
         return q.all(_.map(sizes, function (size:ImageSize):q.Promise<any>
         {
         return self.imageDelegate.resize(tempImagePath, imageBasePath + '_' + ImageSize[size].toLowerCase(), size);
         }))
         .fail(
         function imageResizeFiled(error)
         {
         self.logger.debug('Image resize failed because %s', error);
         });*/
    }

    computePasswordHash(email:string, textPassword:string)
    {
        var md5sum = crypto.createHash('md5');
        return md5sum.update(email + ':' + textPassword).digest('hex');
    }

}
export = UserDelegate
