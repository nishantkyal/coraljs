import moment                                                           = require('moment');
import validator                                                        = require('validator');
import q                                                                = require('q');
import _                                                                = require('underscore');
import fs                                                               = require('fs');
import passport                                                         = require('passport');
import BaseDaoDelegate                                                  = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                                    = require('../delegates/MysqlDelegate');
import UserProfileDelegate                                              = require('../delegates/UserProfileDelegate');
import ImageDelegate                                                    = require('../delegates/ImageDelegate');
import UserPhoneDelegate                                                = require('../delegates/UserPhoneDelegate');
import UserSkillDelegate                                                = require('../delegates/UserSkillDelegate');
import UserEducationDelegate                                            = require('../delegates/UserEducationDelegate');
import UserEmploymentDelegate                                           = require('../delegates/UserEmploymentDelegate');
import UserUrlDelegate                                                  = require('../delegates/UserUrlDelegate');
import ScheduleDelegate                                                 = require('../delegates/ScheduleDelegate');
import ScheduleRuleDelegate                                             = require('../delegates/ScheduleRuleDelegate');
import PricingSchemeDelegate                                            = require('../delegates/PricingSchemeDelegate');
import User                                                             = require('../models/User');
import UserProfile                                                      = require('../models/UserProfile');
import UserSkill                                                        = require('../models/UserSkill');
import PricingScheme                                                    = require('../models/PricingScheme');
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
    private userSkillDelegate = new UserSkillDelegate();
    private userEducationDelegate = new UserEducationDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userUrlDelegate = new UserUrlDelegate();
    private scheduleRuleDelegate = new ScheduleRuleDelegate();
    private scheduleDelegate = new ScheduleDelegate();
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    constructor() { super(User); }

    create(object:any, dbTransaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        if (!Utils.isNullOrEmpty(object) && object.hasOwnProperty(User.COL_PASSWORD))
        {
            object = new User(object);
            var newSeed = Utils.getRandomString(Config.get(Config.PASSWORD_SEED_LENGTH));
            object.setPasswordSeed(newSeed);
            object.setPassword(object.getPasswordHash());
        }

        var self = this;

        return super.create(object, dbTransaction)
            .then(
            function userCreated(user:User)
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setUserId(user.getId());

                return [user, q.all([
                    self.userProfileDelegate.create(userProfile, dbTransaction),
                    self.scheduleRuleDelegate.createDefaultRules(user.getId(), dbTransaction)
                ])];
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
        var superUpdate = super.update.bind(this);
        delete newValues[User.COL_ID];
        delete newValues[User.COL_EMAIL];

        if (newValues.hasOwnProperty(User.COL_PASSWORD) && !Utils.isNullOrEmpty(newValues[User.COL_PASSWORD]))
        {
            return this.find(criteria)
                .then(
                function userFetched(user:User)
                {
                    var newSeed = Utils.getRandomString(Config.get(Config.PASSWORD_SEED_LENGTH));
                    user.setPassword(user.getPasswordHash(user.getEmail(), newValues[User.COL_PASSWORD], newSeed));
                    user.setPasswordSeed(newSeed);
                    return superUpdate(criteria, user, transaction);
                });
        }

        return super.update(criteria, newValues);
    }

    processProfileImage(userId:number, tempImagePath:string):q.Promise<any>
    {
        var self = this;
        var imageBasePath:string = Config.get(Config.PROFILE_IMAGE_PATH) + userId;
        var sizes = [ImageSize.LARGE, ImageSize.MEDIUM, ImageSize.SMALL];

        return q.all(_.map(sizes, function (size:ImageSize):q.Promise<any>
        {
            return self.imageDelegate.resize(tempImagePath, imageBasePath + '_' + ImageSize[size].toLowerCase(), size);
        }))
        .then( function imagesResized(){
            return self.imageDelegate.delete(tempImagePath);
        })
        .fail( function imageResizeFailed(error)
        {
            self.logger.debug('Image resize failed because %s', JSON.stringify(error));
        });
    }
}
export = UserDelegate
