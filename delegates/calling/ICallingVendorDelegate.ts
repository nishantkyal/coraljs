///<reference path='../../_references.d.ts'/>
import q                = require('q');
import CallFragment     = require('../../models/CallFragment');

interface ICallingVendorDelegate
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>;
    makeCall(phone:string, callId?:number, reAttempts?:number):q.Promise<any>;
    updateCallFragment(callFragment:CallFragment);
}
export = ICallingVendorDelegate