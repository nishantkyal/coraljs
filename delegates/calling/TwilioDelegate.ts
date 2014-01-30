import q                                = require('q');
import ICallingVendorDelegate           = require('./ICallingVendorDelegate');
import ApiUrlDelegate                   = require('../ApiUrlDelegate');
import Config                           = require('../../Config');
var twilio                              = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));

class TwilioDelegate implements ICallingVendorDelegate
{
    sendSMS(to:string, body:string, from?:string):q.makePromise
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

    makeCall(phone:string, url?:string):q.makePromise
    {
        var deferred = q.defer();
        twilio.makeCall({

            'to' : phone,
            from : Config.get('twilio.number'),
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