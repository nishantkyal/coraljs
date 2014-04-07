///<reference path='../_references.d.ts'/>
import q                                                                = require('q');
import _                                                                = require('underscore');
import fs                                                               = require('fs');
import passport                                                         = require('passport');
import BaseDaoDelegate                                                  = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                                    = require('../delegates/MysqlDelegate');
import UserProfileDelegate                                              = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                                        = require('../delegates/IntegrationMemberDelegate');
import ImageDelegate                                                    = require('../delegates/ImageDelegate');
import IDao                                                             = require('../dao/IDao')
import UserDAO                                                          = require('../dao/UserDao')
import User                                                             = require('../models/User');
import UserProfile                                                      = require('../models/UserProfile');
import IncludeFlag                                                      = require('../enums/IncludeFlag');
import ImageSize                                                        = require('../enums/ImageSize');
import Config                                                           = require('../common/Config');

/*
 Delegate class for User operations
 */
class UserDelegate extends BaseDaoDelegate
{
    imageDelegate = new ImageDelegate();
    userProfileDelegate = new UserProfileDelegate();
    integrationMemberDelegate = new IntegrationMemberDelegate();

    constructor() { super(new UserDAO()); }

    update(criteria:Object, newValues:any, transaction?:any):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:any):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        delete newValues[User.ID];
        delete newValues[User.EMAIL];

        return super.update(criteria, newValues);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var user:User = result;
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return self.userProfileDelegate.search({'user_id': result.getId()});
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER:
                return self.integrationMemberDelegate.searchByUser(result.getId());
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

}
export = UserDelegate
