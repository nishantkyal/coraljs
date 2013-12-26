import q                        = require('q');
import passport                 = require('passport');
import BaseDaoDelegate          = require('./BaseDaoDelegate');
import UserSettingDelegate      = require('./UserSettingDelegate');
import IDao                     = require('../dao/IDao')
import UserDAO                  = require('../dao/UserDao')
import User                     = require('../models/User');

/**
 Delegate class for User operations
 **/
class UserDelegate extends BaseDaoDelegate {

    create(user?:Object, transaction?:any):q.makePromise
    {
        return super.create(user, transaction)
            .then(
            function userCreated(result)
            {
                return new User(result);
            });
    }

    authenticate(mobileOrEmail:string, password:string):q.makePromise
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

    update(id:string, user:Object):q.makePromise
    {
        delete user['user_id'];
        delete user['id'];
        delete user['email'];

        return super.update({user_id: id}, user);
    }

    getDao():IDao { return new UserDAO(); }

}
export = UserDelegate