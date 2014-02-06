///<reference path='../_references.d.ts'/>
import q                        = require('q');
import passport                 = require('passport');
import BaseDaoDelegate          = require('../delegates/BaseDaoDelegate');
import IDao                     = require('../dao/IDao')
import UserDAO                  = require('../dao/UserDao')
import User                     = require('../models/User');
import VerificationCodeCache    = require('../caches/VerificationCodeCache');

/**
 Delegate class for User operations
 **/
class UserDelegate extends BaseDaoDelegate
{
    create(user?:Object, transaction?:any):q.Promise<any>
    {
        return super.create(user, transaction)
            .then(
            function userCreated(result)
            {
                return new User(result);
            });
    }

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

    update(id:string, user:Object):q.Promise<any>
    {
        delete user['user_id'];
        delete user['id'];
        delete user['email'];

        return super.update({user_id: id}, user);
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