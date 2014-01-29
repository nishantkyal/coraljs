///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./UserSettingDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/UserDao.ts'/>
///<reference path='../models/User.ts'/>
///<reference path='../caches/VerificationCodeCache.ts'/>

/**
 Delegate class for User operations
 **/
module delegates
{
    export class UserDelegate extends BaseDaoDelegate
    {
        create(user?:Object, transaction?:any):Q.Promise<any>
        {
            return super.create(user, transaction)
                .then(
                function userCreated(result)
                {
                    return new models.User(result);
                });
        }

        authenticate(mobileOrEmail:string, password:string):Q.Promise<any>
        {
            return this.getDao().search({email: mobileOrEmail, password: password}, {'fields': ['id', 'first_name', 'last_name']})
                .then(
                function authComplete(result)
                {
                    if (result.length != 0)
                        return new models.User(result[0]);
                    else
                        throw('Authentication failed: Username or password is wrong');
                }
            );
        }

        update(id:string, user:Object):Q.Promise<any>
        {
            delete user['user_id'];
            delete user['id'];
            delete user['email'];

            return super.update({user_id: id}, user);
        }

        createMobileVerificationToken():Q.Promise<any>
        {
            return new caches.VerificationCodeCache().createMobileVerificationCode();
        }

        searchMobileVerificationToken(code:string, ref:string):Q.Promise<any>
        {
            return new caches.VerificationCodeCache().searchMobileVerificationCode(code, ref);
        }

        getDao():dao.IDao { return new dao.UserDAO(); }

    }
}