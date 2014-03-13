///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import IDao                                         = require('../dao/IDao');
import PhoneNumberDao                               = require('../dao/PhoneNumberDao');
import PhoneNumber                                  = require('../models/PhoneNumber');
import Utils                                        = require('../common/Utils');

class PhoneNumberDelegate extends BaseDaoDelegate
{
    create(data:any, transaction?:any):q.Promise<any>
    {
        // Check that phone number doesn't already exist
        var self = this;
        var superCreate = super.create.bind(this);

        return self.find(data)
            .then(
                function handlePhoneNumberSearched(phoneNumber:PhoneNumber):any
                {
                    if (Utils.isNullOrEmpty(phoneNumber) || !phoneNumber.isValid())
                        return superCreate(data, transaction);
                    else
                        return phoneNumber;
                }
            )
    }

    update(id:string, phoneNumber:PhoneNumber):q.Promise<any>
    {
        return super.update({'phoneNumberId': id}, phoneNumber);
    }

    getDao():IDao { return new PhoneNumberDao(); }

}
export = PhoneNumberDelegate