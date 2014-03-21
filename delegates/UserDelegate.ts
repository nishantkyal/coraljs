///<reference path='../_references.d.ts'/>
import q                                                                = require('q');
import _                                                                = require('underscore');
import fs                                                               = require('fs');
import passport                                                         = require('passport');
var gm                                                                  = require('gm');
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
    DEFAULT_FIELDS:string[] = [User.ID, User.FIRST_NAME, User.LAST_NAME, User.SHORT_DESC, User.LONG_DESC, User.EMAIL];

    imageDelegate = new ImageDelegate();

    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        delete newValues[User.ID];
        delete newValues[User.EMAIL];

        return super.update(criteria, newValues);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var user:User = result;
        switch (include)
        {
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return new UserProfileDelegate().search({'user_id': result.getId()});
            case IncludeFlag.INCLUDE_INTEGRATION_MEMBER:
                return new IntegrationMemberDelegate().searchByUser(result.getId());
        }
        return super.getIncludeHandler(include, result);
    }

    processProfileImage(userId:number, imagePath:string):q.Promise<any>
    {
        var self = this;
        var imageBasePath:string = Config.get(Config.PROFILE_IMAGE_PATH) + userId;
        var sizes = [ImageSize.SMALL, ImageSize.MEDIUM, ImageSize.LARGE];

        return q.all(_.map(sizes, function(size:ImageSize) {
            return self.imageDelegate.resize(imagePath, imageBasePath + '_' + ImageSize[size].toLowerCase(), size);
        }));
    }

    getDao():IDao { return new UserDAO(); }

}
export = UserDelegate