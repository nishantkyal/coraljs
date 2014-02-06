///<reference path='../../_references.d.ts'/>
import q                                = require('q');
import twilio                           = require('twilio');
import ICallingVendorDelegate           = require('./ICallingVendorDelegate');
import ApiUrlDelegate                   = require('../ApiUrlDelegate');
import Config                           = require('../../common/Config');

class TwilioDelegate implements ICallingVendorDelegate
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>
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

    makeCall(phone:string, url?:string):q.Promise<any>
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