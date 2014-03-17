///<reference path='../../_references.d.ts'/>
import q                                = require('q');
import twilio                           = require('twilio');
import ICallingVendorDelegate           = require('./ICallingVendorDelegate');
import ApiUrlDelegate                   = require('../ApiUrlDelegate');
import Config                           = require('../../common/Config');

class TwilioDelegate implements ICallingVendorDelegate
{
    private static client = twilio(Config.get(Config.TWILIO_ACCOUNT_SID), Config.get(Config.TWILIO_AUTH_TOKEN));

    sendSMS(to:string, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();
        TwilioDelegate.client.sendMessage({

            to: to,
            from: Config.get(Config.TWILIO_NUMBER),
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

    makeCall(phone:string, url?:string):q.Promise<any>
    {
        var deferred = q.defer();
        TwilioDelegate.client.makeCall({

            'to' : phone,
            from : Config.get(Config.TWILIO_NUMBER),
            url  : url

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
export = TwilioDelegate