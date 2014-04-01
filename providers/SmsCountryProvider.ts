///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import _                                                        = require('underscore');
import request                                                  = require('request');
import ISmsProvider                                             = require('../providers/ISmsProvider');
import Config                                                   = require('../common/Config');
import CallFragment                                             = require('../models/CallFragment');

class SmsCountryProvider implements ISmsProvider
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();

        var smsCountrySendMessageUrl = 'http://api.smscountry.com/SMSCwebservice_bulk.aspx';

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