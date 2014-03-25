import express                                                  = require('express');
import json2xml                                                 = require('json2xml');
import moment                                                   = require('moment');
import ApiConstants                                             = require('../enums/ApiConstants');
import ApiFlags                                                 = require('../enums/ApiFlags');
import PhoneType                                                = require('../enums/PhoneType');
import CallFragmentStatus                                       = require('../enums/CallFragmentStatus');
import AgentType                                                = require('../enums/AgentType');
import IntegrationMemberDelegate                                = require('../delegates/IntegrationMemberDelegate');
import TwilioDelegate                                           = require('../delegates/calling/TwilioDelegate');
import PhoneCallDelegate                                        = require('../delegates/PhoneCallDelegate');
import UserPhoneDelegate                                        = require('../delegates/UserPhoneDelegate');
import TwilioUrlDelegate                                        = require('../delegates/TwilioUrlDelegate');
import CallFragmentDelegate                                     = require('../delegates/CallFragmentDelegate');
import SMSDelegate                                              = require('../delegates/SMSDelegate');
import TimeJobDelegate                                          = require('../delegates/TimeJobDelegate');
import Utils                                                    = require('../common/Utils');
import Config                                                   = require('../common/Config');
import PhoneCall                                                = require('../models/PhoneCall');
import User                                                     = require('../models/User');
import IntegrationMember                                        = require('../models/IntegrationMember');
import UserPhone                                                = require('../models/UserPhone');
import CallFragment                                             = require('../models/CallFragment');
import PhoneCallCache                                           = require('../caches/PhoneCallCache')
import PhoneCallCacheModel                                      = require('../caches/models/PhoneCallCacheModel');

class TwimlOutApi
{
    private static DIAL_CALL_SID:string = 'DialCallSid';
    private static CALL_SID:string = 'CallSid';
    private static USER_NUMBER:string = 'To';
    private static COMPLETED:string = 'completed'; //TODO same definition being repeated in CallFragmentDelegate
    private static BUSY:string = 'busy';
    private static FAILED:string = 'failed';
    private static NO_ANSWER:       string = 'no-answer';
    private static DIAL_CALL_STATUS:string = 'DialCallStatus';
    private static CALLSTATUS:string = 'CallStatus';
    private static DURATION:string = 'Duration';
    private static START_TIME:string = 'start_time';


    constructor(app)
    {
        app.get(TwilioUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        { // called after User picks up the phone...need to sen dback expert phone details
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            new PhoneCallCache().getPhoneCall(callId)
                .then(
                function CallFetched(call:any){ //get the info for this call from cache and send it back as xml to TWILIO
                    var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                    var pageData = {};
                    pageData['actionURL'] = req.protocol + "://" + req.get('host') + TwilioUrlDelegate.twimlJoinCall(callId);
                    pageData['timeLimit'] = phoneCallCacheObj.getDuration();
                    pageData['phoneNumber'] = phoneCallCacheObj.getExpertNumber();
                    pageData['record'] = (phoneCallCacheObj.getRecorded() == false) ? 'false':'true' ;
                    pageData['message'] = 'Please wait while we get Mr. ' + phoneCallCacheObj.getExpertName() + ' on the call';
                    res.render('../delegates/calling/TwilioXMLJoin.jade',pageData );
                })
                .fail(function(error){
                    var pageData = {};
                    pageData['message'] = 'Internal Server Error';
                    res.render('../delegates/calling/TwilioXMLSay.jade',pageData );
                })
        });

        app.post(TwilioUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        { // called after expert has hung up. saving details into call fragment here.
            var attemptCount = parseInt(req.query[TwilioDelegate.ATTEMPT_COUNT]);
            if(Utils.isNullOrEmpty(attemptCount))
                attemptCount = 0;

            var dialCallStatus = req.body[TwimlOutApi.DIAL_CALL_STATUS];
            var pageData = {};

            var callFragment:CallFragment = new CallFragment(); //save information received in CaLLFragment
            callFragment.setCallId(parseInt(req.params[ApiConstants.PHONE_CALL_ID]));
            callFragment.setAgentCallSidExpert(req.body[TwimlOutApi.DIAL_CALL_SID]);
            callFragment.setAgentCallSidUser(req.body[TwimlOutApi.CALL_SID]);
            callFragment.setFromNumber(req.body[TwimlOutApi.USER_NUMBER]);
            callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_EXPERT_ERROR); // if successful then this value will be overwritten

            switch(dialCallStatus) //decide the message based on expertCallStatus and attemptCount
            {
                case TwimlOutApi.COMPLETED:
                    pageData['message'] = 'Call Completed. Thank you for using our services';
                    break;
                case TwimlOutApi.BUSY:
                    pageData['message'] = 'Call could not be completed. We regret the inconvenience caused.';
                    break;
                case TwimlOutApi.NO_ANSWER:
                    if(attemptCount == 1)
                        pageData['message'] = 'Call could not be completed. We regret the inconvenience caused';
                    else
                        pageData['message'] = 'Expert did not answer the call. We will retry in ' + Config.get("call.retry.gap") +  ' minutes';
                    break;
                default:
                    if(attemptCount == 1)
                        pageData['message'] = 'Call could not be completed. We regret the inconvenience caused';
                    else
                        pageData['message'] = 'The expert is unreachable. We will retry in ' + Config.get("call.retry.gap") + ' minutes';
            }
            res.render('../delegates/calling/TwilioXMLSay.jade',pageData );

            if(attemptCount == 0 && dialCallStatus != TwimlOutApi.COMPLETED && dialCallStatus != TwimlOutApi.BUSY)
                console.log('Reattempt to be made');// TODO change this to rescheduling function

            new CallFragmentDelegate().saveCallFragment(callFragment);

            //TODO don't send sms to landline (twilio doesn't send it and return error code 21614). However, we should not even make the api call.
            new SMSDelegate().sendStatusSMS(callFragment, attemptCount);

        });

        app.post(TwilioUrlDelegate.twimlCallback(), function (req:express.Request, res:express.Response)
        {//called after User hangs up the call
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            res.json('OK');

            var callStatus = req.body[TwimlOutApi.CALLSTATUS];
            var attemptCount = parseInt(req.query[TwilioDelegate.ATTEMPT_COUNT]);
            if(Utils.isNullOrEmpty(attemptCount))
                attemptCount = 0;

            if(callStatus != TwimlOutApi.COMPLETED) // if completed then information saved after expert drops the call
            { //save information for failed call
                if(attemptCount == 0)
                    console.log('Reattempt to be made');// TODO change this to rescheduling function, make change in num_reattempt in call table and cache
                var duration:number = parseInt(req.body[TwimlOutApi.DURATION]);

                var callFragment:CallFragment = new CallFragment();
                callFragment.setCallId(parseInt(req.params[ApiConstants.PHONE_CALL_ID]));
                callFragment.setAgentCallSidUser(req.body[TwimlOutApi.CALL_SID]);
                callFragment.setFromNumber(req.body[TwimlOutApi.USER_NUMBER]);
                callFragment.setDuration(duration);
                callFragment.setAgentId(AgentType.TWILIO);
                if(callStatus == TwimlOutApi.FAILED) //failed means twilio was not able to connect the call
                    callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_SERVER_ERROR);
                else
                    callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_USER_ERROR);

                var twilioClient = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));
                twilioClient.calls(callFragment.getAgentCallSidUser()).get( //to get call start time
                    function(err, callDetails)
                    {
                        if(!Utils.isNullOrEmpty(callDetails))
                        {
                            callFragment.setStartTime(moment(callDetails[TwimlOutApi.START_TIME]).valueOf());
                            new CallFragmentDelegate().create(callFragment);
                        }
                    });

                //send sms to user and expert informing them about the status
                new PhoneCallCache().getPhoneCall(callId)
                    .then(
                    function CallFetched(call:any){
                        var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                        var tempCallFragment:CallFragment = callFragment;
                        if(phoneCallCacheObj.getExpertPhoneType() == PhoneType.MOBILE)
                            tempCallFragment.setToNumber(phoneCallCacheObj.getExpertNumber());
                        new SMSDelegate().sendStatusSMS(tempCallFragment, attemptCount);
                    })
            }
        });

        //ONLY FOR TESTING
        //TODO remove this after testing
        app.get(TwilioUrlDelegate.twimlGenerateCall(), function (req:express.Request, res:express.Response)
        {
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var url:string = req.protocol + "://" + req.get('host') + TwilioUrlDelegate.twimlJoinCall(callId);
            var callbackUrl:string = req.protocol + "://" + req.get('host') + TwilioUrlDelegate.twimlCallback(callId);
            new PhoneCallDelegate().triggerCall(callId, url, callbackUrl);

            new PhoneCallCache().createPhoneCallCache(callId)
                .then(
                    function (call:PhoneCallCacheModel)
                    {
                        var sds:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                        res.json('OK');
                    }
                );

            /* PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
                .then(
                function callFetched(call:PhoneCall)
                {
                    //return new PhoneCallCache().createPhoneCallCache(call);
                    new PhoneCallCache().getPhoneCall(callId)
                        .then(
                            function(call:PhoneCall)
                            {
                                console.log("d");
                            }
                        )
                });
            var ttt = new TimeJobDelegate().scheduleJobs()
                .then (
                function jobsFetched(jobs)
                {
                    res.json(jobs.length);
                },
                function fetchError(error)
                {
                    res.json('ERROR');
                }
            );*/
        });
    }
}
export = TwimlOutApi

