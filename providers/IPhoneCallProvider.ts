///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import CallFragment                                         = require('../models/CallFragment');

interface IPhoneCallProvider
{
    makeCall(phone:string, callId?:number, reAttempts?:number):q.Promise<any>;
    updateCallFragment(callFragment:CallFragment):q.Promise<any>;
}
export = IPhoneCallProvider