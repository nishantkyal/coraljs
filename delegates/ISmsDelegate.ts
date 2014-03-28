import q                                                    = require('q');
import CallFragment                                         = require('../models/CallFragment');

interface ISmsDelegate
{
    sendReminderSMS(callId:number):q.Promise<any>;
    sendStatusSMS(callFragment:CallFragment, attemptCount:number):q.Promise<any>;
    sendSuccessSMS(expertNumber:string, userNumber:string, callId:number, duration:number):q.Promise<any>;
    sendRetrySMS(expertNumber:string, userNumber:string, callId:number):q.Promise<any>;
    sendFailureSMS(expertNumber:string, userNumber:string, callId:number):q.Promise<any>;
    sendFailureUserSMS(userNumber:string, callId:number):q.Promise<any>;
    sendVerificationSMS(to:string, code:string):q.Promise<any>;
}
export = ISmsDelegate