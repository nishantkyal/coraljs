///<reference path='../_references.d.ts'/>
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import IDao                             = require('../dao/IDao');
import UserPhoneDao                     = require('../dao/UserPhoneDao');
import UserPhone                        = require('../models/UserPhone');

class UserPhoneDelegate extends BaseDaoDelegate
{
    create(data:any, transaction?:any):q.Promise<any>
    {
        // Check that phone number doesn't already exist
        return super.search(data)
            .then(
                function handlePhoneNumberSearched(rows:Array<UserPhone>):any
                {
                    if (rows.length != 0)
                        return this.create(data, transaction);
                    else
                        return rows[0];
                }
            )
    }

    update(id:number, userPhone:UserPhone):q.Promise<any>
    {
        return super.update({'id': id}, userPhone);
    }

    getByUserId(userId:number):q.Promise<any>
    {
        return this.search({'user_id': userId });
    }

    constructor() { super(new UserPhoneDao()); }
}
export = UserPhoneDelegate