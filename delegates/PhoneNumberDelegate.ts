///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='../models/PhoneNumber.ts'/>
///<reference path='../dao/PhoneNumberDao.ts'/>

module delegates
{
    export class PhoneNumberDelegate extends BaseDaoDelegate
    {
        create(data:any, transaction?:any):Q.Promise<any>
        {
            // Check that phone number doesn't already exist
            return super.search(data)
                .then(
                function handlePhoneNumberSearched(rows:Array<models.PhoneNumber>):any
                {
                    if (rows.length != 0)
                        return this.create(data, transaction);
                    else
                        return rows[0];
                }
            )
        }

        update(id:string, phoneNumber:models.PhoneNumber):Q.Promise<any>
        {
            return super.update({'phoneNumberId': id}, phoneNumber);
        }

        getDao():dao.IDao { return new dao.PhoneNumberDao(); }
    }
}