///<reference path='../_references.d.ts'/>
///<reference path='../models/User.ts'/>
///<reference path='../common/Config.ts'/>

/**
 User Cache
 1. Password reset tokens
 **/
class UserCache
{
    getResetTokenUser(resetToken:string):Q.Promise<any>
    {
        return null;
    }

    addResetToken(token:string, user:models.User, expireAfter:number = common.Config.get('password_reset.expiry')):Q.Promise<any>
    {
        return null;
    }
}
export = UserCache