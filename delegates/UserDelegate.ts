///<reference path='../_references.d.ts'/>
import q                                                                = require('q');
import passport                                                         = require('passport');
import BaseDaoDelegate                                                  = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                                    = require('../delegates/MysqlDelegate');
import UserProfileDelegate                                              = require('../delegates/UserProfileDelegate');
import IntegrationMemberDelegate                                        = require('../delegates/IntegrationMemberDelegate');
import IDao                                                             = require('../dao/IDao')
import UserDAO                                                          = require('../dao/UserDao')
import User                                                             = require('../models/User');
import UserProfile                                                      = require('../models/UserProfile');
import IncludeFlag                                                      = require('../enums/IncludeFlag');

/*
 Delegate class for User operations
 */
class UserDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [User.ID, User.FIRST_NAME, User.LAST_NAME, User.SHORT_DESC, User.LONG_DESC, User.EMAIL];

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

    getDao():IDao { return new UserDAO(); }

}
export = UserDelegate