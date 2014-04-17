///<reference path='../_references.d.ts'/>
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import UserPhoneDao                     = require('../dao/UserPhoneDao');
import UserPhone                        = require('../models/UserPhone');
import Utils                            = require('../common/Utils');

class UserPhoneDelegate extends BaseDaoDelegate
{
    create(data:any, transaction?:any):q.Promise<any>
    {
        // Check that phone number doesn't already exist
        var self = this;
        var superCreate = super.create.bind(this);

        return self.find(data)
            .then(
            function handleUserPhoneSearched(UserPhone:UserPhone):any
            {
                if (Utils.isNullOrEmpty(UserPhone) || !UserPhone.isValid())
                    return superCreate(data, transaction);
                else
                    return UserPhone;
            }
        );
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