///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import request                                                  = require('request');
import ISmsProvider                                             = require('../providers/ISmsProvider');
import Config                                                   = require('../common/Config');
import Utils                                                    = require('../common/Utils');
import CallFragment                                             = require('../models/CallFragment');
import UserPhone                                                = require('../models/UserPhone');
import PhoneType                                                = require('../enums/PhoneType');

class SmsCountryProvider implements ISmsProvider
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>
    sendSMS(to:UserPhone, body:string, from?:string):q.Promise<any>
    sendSMS(to:any, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();

        if (Utils.getObjectType(to) == 'UserPhone' && to.getType() != PhoneType.MOBILE)
            throw("Can't send SMS to " + to.toJson());

        var smsCountrySendMessageUrl = Config.get(Config.SMS_COUNTRY_URL);

        var data:any = {
            User: Config.get(Config.SMS_COUNTRY_USER),
            passwd: Config.get(Config.SMS_COUNTRY_PASSWORD),
            Sid: 'SNTALK',
            MobileNumber: to,
            Message: body,
            Mtype: 'N'
        };

        smsCountrySendMessageUrl += '?' + _.map(_.keys(data), function(key) {
            return key + '=' + data[key];
        }).join('&');

        request.get(smsCountrySendMessageUrl, function (error:any, response:any, body:any)
        {
            if (error)
                deferred.reject(error);
            else
                deferred.resolve(response);
        });

        return deferred.promise;
    }

}
export = SmsCountryProvider