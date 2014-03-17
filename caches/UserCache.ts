import q                    = require('q');
import User                 = require('../models/User');
import Config               = require('../common/Config');

/*
 User Cache
 1. Password reset tokens
 */
class UserCache
{
    getResetTokenUser(resetToken:string):q.Promise<any>
    {
        return null;
    }

    addResetToken(token:string, user:User, expireAfter:number = Config.get(Config.PASSWORD_RESET_EXPIRY)):q.Promise<any>
    {
        return null;
    }
}
export = UserCache