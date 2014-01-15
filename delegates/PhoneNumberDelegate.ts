import q                                = require('q');
import BaseDaoDelegate                  = require('./BaseDaoDelegate');
import IDao                             = require('../dao/IDao');
import PhoneNumberDao                   = require('../dao/PhoneNumberDao');
import PhoneNumber                      = require('../models/PhoneNumber');

class PhoneNumberDelegate extends BaseDaoDelegate
{
    create(data:Object, transaction?:any):q.makePromise
    {
        // Check that phone number doesn't already exist
        return super.search(data)
            .then(
                function handlePhoneNumberSearched(rows:Array)
                {
                    if (rows.length != 0)
                        return this.create(data, transaction);
                    else
                        return rows[0];
                }
            )
    }

    update(id:string, phoneNumber:PhoneNumber):q.makePromise
    {
        return super.update({'phoneNumberId': id}, phoneNumber);
    }

    getDao():IDao { return new PhoneNumberDao(); }
}
export = PhoneNumberDelegate