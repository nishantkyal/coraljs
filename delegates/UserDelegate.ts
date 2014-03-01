///<reference path='../_references.d.ts'/>
import q                        = require('q');
import passport                 = require('passport');
import BaseDaoDelegate          = require('../delegates/BaseDaoDelegate');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import UserProfileDelegate      = require('../delegates/UserProfileDelegate');
import IDao                     = require('../dao/IDao')
import UserDAO                  = require('../dao/UserDao')
import User                     = require('../models/User');
import UserProfile              = require('../models/UserProfile');
import VerificationCodeCache    = require('../caches/VerificationCodeCache');
import IncludeFlag              = require('../enums/IncludeFlag');

/**
 Delegate class for User operations
 **/
class UserDelegate extends BaseDaoDelegate
{
    authenticate(mobileOrEmail:string, password:string):q.Promise<any>
    {
        return this.getDao().search({email: mobileOrEmail, password: password}, {'fields': ['id', 'first_name', 'last_name']})
            .then(
            function authComplete(result)
            {
                if (result.length != 0)
                    return new User(result[0]);
                else
                    throw('Authentication failed: Username or password is wrong');
            }
        );
    }

    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        delete newValues[User.ID];
        delete newValues[User.EMAIL];

        return super.update(criteria, newValues);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        switch (include)
        {
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return new UserProfileDelegate().search({'user_id': result[User.ID]});
        }
        return super.getIncludeHandler(include, result);
    }

    createMobileVerificationToken():q.Promise<any> { return new VerificationCodeCache().createMobileVerificationCode(); }
    searchMobileVerificationToken(code:string, ref:string):q.Promise<any> { return new VerificationCodeCache().searchMobileVerificationCode(code, ref); }

    createEmailVerificationToken(userId:number):q.Promise<any> { return new VerificationCodeCache().createEmailVerificationCode(userId); }
    searchEmailVerificationToken(userId:number, code:string):q.Promise<any> { return new VerificationCodeCache().searchEmailVerificationCode(userId, code); }

    createPasswordResetToken(userId:number):q.Promise<any> { return new VerificationCodeCache().createPasswordResetCode(userId); }
    searchPasswordResetToken(userId:number, code:string):q.Promise<any> { return new VerificationCodeCache().searchPasswordResetCode(userId, code); }

    getDao():IDao { return new UserDAO(); }

}
export = UserDelegate