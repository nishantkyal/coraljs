///<reference path='../../_references.d.ts'/>
///<reference path='./ICallingVendorDelegate.ts'/>
///<reference path='../ApiUrlDelegate.ts'/>
///<reference path='../../common/Config.ts'/>
var twilio = require('twilio')(common.Config.get('twilio.account_sid'), common.Config.get('twilio.auth_token'));

module delegates
{
    export class TwilioDelegate implements ICallingVendorDelegate
    {
        sendSMS(to:string, body:string, from?:string):Q.Promise<any>
        {
            var deferred = q.defer();
            twilio.sendMessage({

                to: to,
                from: '+17068727043',
                body: body

            }, function (err, responseData)
            {
                if (!err)
                    deferred.resolve(responseData);
                else
                    deferred.reject(err);
            });
            return deferred.promise;
        }

        makeCall(phone:string, url?:string):Q.Promise<any>
        {
            var deferred = q.defer();
            twilio.makeCall({

                'to': phone,
                from: common.Config.get('twilio.number'),
                url: url

            }, function (err, responseData)
            {
                if (!err)
                    deferred.resolve(responseData);
                else
                    deferred.reject(err);
            });
            return deferred.promise;
        }
    }
}