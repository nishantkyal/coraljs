///<reference path='../_references.d.ts'/>
import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import IDao                             = require('../dao/IDao');
import PhoneNumberDao                   = require('../dao/PhoneNumberDao');
import PhoneNumber                      = require('../models/PhoneNumber');

class PhoneNumberDelegate extends BaseDaoDelegate
{
    create(data:any, transaction?:any):q.Promise<any>
    {
        // Check that phone number doesn't already exist
        return super.search(data)
            .then(
                function handlePhoneNumberSearched(rows:Array<PhoneNumber>):any
                {
                    if (rows.length != 0)
                        return this.create(data, transaction);
                    else
                        return rows[0];
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