import q                                = require('q');
import log4js                           = require('log4js');
import Utils                            = require('../../common/Utils');
import ICallingVendorDelegate           = require('./ICallingVendorDelegate');
import CallFragment                     = require('../../models/CallFragment');

class SMSCountryDelegate implements ICallingVendorDelegate
{
    logger:log4js.Logger;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    sendSMS(to:string, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();
        return deferred.promise;
    }

    makeCall(phone:string, callId?:number, reAttempts?:number):q.Promise<any>
    {
        var deferred = q.defer();
        return deferred.promise;
    }

    updateCallFragment(callFragment:CallFragment):q.Promise<any>
    {
        var deferred = q.defer();
        return deferred.promise;
    }

}
export = SMSCountryDelegate