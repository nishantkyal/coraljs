///<reference path='../_references.d.ts'/>
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import UserPhone                        = require('../models/UserPhone');
import Utils                            = require('../common/Utils');

class UserPhoneDelegate extends BaseDaoDelegate
{
    create(data:any, transaction?:Object):q.Promise<any>
    {
        // Check that phone number doesn't already exist
        var self = this;
        var superCreate = super.create.bind(this);

        return self.find(data)
            .then(
            function handleUserPhoneSearched(userPhone:UserPhone):any
            {
                if (Utils.isNullOrEmpty(userPhone) || !userPhone.isValid())
                    return superCreate(data, transaction);
                else
                    return userPhone;
            });
    }

    constructor() { super(UserPhone); }
}
export = UserPhoneDelegate