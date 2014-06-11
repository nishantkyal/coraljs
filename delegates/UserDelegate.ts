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
import UserDAO                                                          = require('../dao/UserDao')
import User                                                             = require('../models/User');
import UserProfile                                                      = require('../models/UserProfile');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import ImageSize                                                        = require('../enums/ImageSize');
import UserStatus                                                       = require('../enums/UserStatus');
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

    constructor() { super(new UserDAO()); }

    create(object:any, transaction?:Object):q.Promise<any>
    {
        if (!Utils.isNullOrEmpty(object) && object.hasOwnProperty(User.PASSWORD))
            object[User.PASSWORD] = this.computePasswordHash(object[User.EMAIL], object[User.PASSWORD]);

        var self = this;

        return super.create(object, transaction)
            .then(
            function userCreated(user:User)
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setUserId(user.getId());

                return [user, self.userProfileDelegate.create(userProfile)];
            })
            .spread(
            function userProfileCreated(user:User, profile:UserProfile)
            {
                return self.userProfileDelegate.fetchAllDetailsFromLinkedIn(user.getId(), profile.getId())
                    .fail(
                    function linkedInFetchFailed(error)
                    {
                        self.logger.debug('LinkedIn profile fetch failed for user id: %s, error: %s', user.getId(), JSON.stringify(error));
                        return user;
                    });
            })
            .then(
            function profileDetailsFetched(user:User)
            {
                return user;
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
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return self.userProfileDelegate.search({'user_id': _.uniq(_.pluck(result, User.ID))});
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

    recalculateStatus(criteria:number):q.Promise<any>;
    recalculateStatus(criteria:Object):q.Promise<any>;
    recalculateStatus(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var user:User;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        return this.find(criteria)
            .then(
            function userFound(u)
            {
                user = u;
                return self.userPhoneDelegate.find({user_id: user.getId(), verified: true}, null, null, transaction);
            })
            .then(
            function phoneFound(phone)
            {
                if (Utils.isNullOrEmpty(phone))
                    throw(UserStatus.MOBILE_NOT_VERIFIED);
                else
                    return self.userProfileDelegate.find(Utils.createSimpleObject(UserProfile.USER_ID, user.getId()), null, null, transaction);
            })
            .fail(
            function updateStatus(status)
            {
                return self.update({id: user.getId()}, {status: status}, transaction);
            });
    }

    computePasswordHash(email:string, textPassword:string)
    {
        var md5sum = crypto.createHash('md5');
        return md5sum.update(email + ':' + textPassword).digest('hex');
    }

}
export = UserDelegate
