///<reference path='../../_references.d.ts'/>
import q                                                = require('q');
import CallFragment                                     = require('../../models/CallFragment');
import UserPhone                                        = require('../../models/UserPhone');

interface ICallingVendorDelegate
{
    sendSMS(to:UserPhone, body:string, from?:string):q.Promise<any>;
    makeCall(phone:UserPhone, callId?:number, reAttempts?:number):q.Promise<any>;
    updateCallFragment(callFragment:CallFragment);
}
export = ICallingVendorDelegate