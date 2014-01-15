import q                    = require('q');
import User                 = require('../models/User');
import Config               = require('../Config');

/**
 User Cache
 1. Password reset tokens
 **/
class UserCache
{
    getResetTokenUser(resetToken:string):q.makePromise
    {
        return null;
    }

    addResetToken(token:string, user:User, expireAfter:number = Config.get('password_reset.expiry')):q.makePromise
    {
        return null;
    }
}
export = UserCache