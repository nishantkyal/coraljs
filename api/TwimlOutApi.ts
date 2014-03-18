import express                      = require('express');
import json2xml                     = require('json2xml');
import ApiConstants                 = require('../enums/ApiConstants');
import ApiFlags                     = require('../enums/ApiFlags');
import PhoneType                    = require('../enums/PhoneType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import AgentType                    = require('../enums/AgentType');
import CallStatus                   = require('../enums/CallStatus');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import TwilioDelegate               = require('../delegates/calling/TwilioDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate');
import UserPhoneDelegate            = require('../delegates/UserPhoneDelegate');
import TwilioUrlDelegate            = require('../delegates/TwilioUrlDelegate');
import CallFragmentDelegate         = require('../delegates/CallFragmentDelegate');
import SMSDelegate                  = require('../delegates/SMSDelegate');
import TimeJobDelegate              = require('../delegates/TimeJobDelegate');
import MysqlDelegate                = require('../delegates/MysqlDelegate');
import Utils                        = require('../common/Utils');
import log4js                       = require('log4js');
import Config                       = require('../common/Config');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import UserPhone                    = require('../models/UserPhone');
import CallFragment                 = require('../models/CallFragment');
import PhoneCallCache               = require('../caches/PhoneCallCache')
import PhoneCallCacheModel          = require('../caches/models/PhoneCallCacheModel');

class TwimlOutApi
{
    private static DIALCALLSID:string = 'DialCallSid';
    private static CALLSID:string = 'CallSid';
    private static USERNUMBER:string = 'To';
    private static COMPLETED:string = 'completed'; //TODO same definition being repeated in CallFragmentDelegate
    private static BUSY:string = 'busy';
    private static FAILED:string = 'failed';
    private static NOANSWER:string = 'no-answer';
    private static DIALCALLSTATUS:string = 'DialCallStatus';
    private static CALLSTATUS:string = 'CallStatus';
    private static DURATION:string = 'Duration';
    private static START_TIME:string = 'start_time';

    private PhoneCallCache;
    private CallFragmentDelegate;
    private SMSDelegate;
    private PhoneCallDelegate;
    private TimeJobDelegate;
    private logger:log4js.Logger;

    constructor(app)
    {
        var self = this;
        self.PhoneCallCache = new PhoneCallCache();
        self.CallFragmentDelegate = new CallFragmentDelegate();
        self.SMSDelegate = new SMSDelegate();
        self.PhoneCallDelegate = new PhoneCallDelegate();
        self.TimeJobDelegate = new TimeJobDelegate();
        self.logger = log4js.getLogger(Utils.getClassName(this));

        /*
        The api is called when Twilio requests information to add a call to existing call.
         -- Information is fetched from cache (cached at the time of scheduling)
         -- actionURL is the url which is pinged when expet drops the call
         -- message is the text played when expert is being added to call
         */
        app.get(TwilioUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        { // called after User picks up the phone...need to sen dback expert phone details
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            self.PhoneCallCache.getPhoneCall(callId)
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

        /*
         The api is called when expert drops the call
         -- create a call fragment to save information received in body of the call
         -- based on dialCallStatus play a message to the user
         -- If this was the first attempt and call failed then reschedule this call
         -- save the call Fragment after getting information(of expert call for duration etc) from twilio
         -- sendSMS based on call status
         -- If this was second attempt then update call status in call table
         */
        app.post(TwilioUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        { // called after expert has hung up. saving details into call fragment here.
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var attemptCount = parseInt(req.query[TwilioDelegate.ATTEMPTCOUNT]);
            if(Utils.isNullOrEmpty(attemptCount))
                attemptCount = 0;

            var dialCallStatus = req.body[TwimlOutApi.DIALCALLSTATUS];
            var pageData = {};

            var callFragment:CallFragment = new CallFragment(); //save information received in CallFragment
            callFragment.setCallId(parseInt(req.params[ApiConstants.PHONE_CALL_ID]));
            callFragment.setAgentCallSidExpert(req.body[TwimlOutApi.DIALCALLSID]);
            callFragment.setAgentCallSidUser(req.body[TwimlOutApi.CALLSID]);
            callFragment.setFromNumber(req.body[TwimlOutApi.USERNUMBER]);
            callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_EXPERT_ERROR); // if successful then this value will be overwritten

            switch(dialCallStatus) //decide the message based on expertCallStatus and attemptCount
            {
                case TwimlOutApi.COMPLETED:
                    pageData['message'] = 'Call Completed. Thank you for using our services';
                    break;
                case TwimlOutApi.BUSY:
                    pageData['message'] = 'Call could not be completed. We regret the inconvenience caused.';
                    break;
                case TwimlOutApi.NOANSWER:
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
                self.PhoneCallDelegate.rescheduleCall(callId, attemptCount);

            self.CallFragmentDelegate.updateCallFragment(callFragment)
                .then(
                function getCallFragment(updatedCallFragment:CallFragment)
                {
                    self.CallFragmentDelegate.create(updatedCallFragment);
                    //TODO don't send sms to landline (twilio doesn't send it and return error code 21614). However, we should not even make the api call.
                    self.SMSDelegate.sendStatusSMS(updatedCallFragment, attemptCount);
                    if(attemptCount == 1)
                    {
                        if(updatedCallFragment.getCallFragmentStatus() == CallFragmentStatus.SUCCESS)
                            self.PhoneCallDelegate.updateCallStatus(callId, CallStatus.COMPLETED);
                        else
                            self.PhoneCallDelegate.updateCallStatus(callId, CallStatus.FAILED);
                    }
                })
                .fail(function(error){
                    self.logger.debug('Error in saving call fragment');
                })
        });

        /*
         The api is called when user drops the call
         -- Information is saved only when this call was not completed (i.e. not picked/unreachable)
         -- If this was the first attempt and call failed then reschedule this call
         -- save the call Fragment
         -- sendSMS based on call status
         -- If this was second attempt then update call status in call table
         */
        app.post(TwilioUrlDelegate.twimlCallback(), function (req:express.Request, res:express.Response)
        {//called after User hangs up the call
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            res.json('OK');

            var callStatus = req.body[TwimlOutApi.CALLSTATUS];
            var attemptCount = parseInt(req.query[TwilioDelegate.ATTEMPTCOUNT]);
            if(Utils.isNullOrEmpty(attemptCount))
                attemptCount = 0;

            if(callStatus != TwimlOutApi.COMPLETED) // if completed then information saved after expert drops the call
            { //save information for failed call
                if(attemptCount == 0)
                    self.PhoneCallDelegate.rescheduleCall(callId, attemptCount);

                var duration:number = parseInt(req.body[TwimlOutApi.DURATION]);

                var callFragment:CallFragment = new CallFragment();
                callFragment.setCallId(parseInt(req.params[ApiConstants.PHONE_CALL_ID]));
                callFragment.setAgentCallSidUser(req.body[TwimlOutApi.CALLSID]);
                callFragment.setFromNumber(req.body[TwimlOutApi.USERNUMBER]);
                callFragment.setDuration(duration);
                callFragment.setAgentId(AgentType.TWILIO);
                if(callStatus == TwimlOutApi.FAILED) //failed means twilio was not able to connect the call
                    callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_SERVER_ERROR);
                else
                    callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_USER_ERROR);

                self.CallFragmentDelegate.updateCallFragmentStartTime(callFragment)
                    .then(
                    function getCallFragment(updatedCallFragment:CallFragment)
                    {
                        self.CallFragmentDelegate.create(updatedCallFragment);
                        if(attemptCount == 1)
                        {
                            if(updatedCallFragment.getCallFragmentStatus() == CallFragmentStatus.SUCCESS)
                                self.PhoneCallDelegate.updateCallStatus(callId, CallStatus.COMPLETED);
                            else
                                self.PhoneCallDelegate.updateCallStatus(callId, CallStatus.FAILED)
                                    .fail(function(error){
                                        self.logger.debug("Call status not updated");
                                    })
                        }
                    })
                    .fail(function(error){
                        self.logger.debug('Error in saving call fragment');
                    })

                //send sms to user and expert informing them about the status
                self.PhoneCallCache.getPhoneCall(callId)
                    .then(
                    function CallFetched(call:any){
                        var phoneCallCacheObj:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                        var tempCallFragment:CallFragment = callFragment;
                        if(phoneCallCacheObj.getExpertPhoneType() == PhoneType.MOBILE)
                            tempCallFragment.setToNumber(phoneCallCacheObj.getExpertNumber());
                        self.SMSDelegate.sendStatusSMS(tempCallFragment, attemptCount);
                    })
                    .fail(function(error){
                        self.logger.debug('Failed to send failure SMS to callId:' + callId);
                    })
            }
        });

        //ONLY FOR TESTING
        //TODO remove this after testing
        app.get(TwilioUrlDelegate.twimlGenerateCall(), function (req:express.Request, res:express.Response)
        {
            self.logger.debug("debug check");
            self.logger.info("info check");
            self.logger.error("error check");
            self.logger.trace("trace check");
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var transaction = null;
            self.TimeJobDelegate.scheduleJobs();
            //self.PhoneCallDelegate.rescheduleCall(callId, 222);
            //new PhoneCallDelegate().triggerCall(callId);
            /*new PhoneCallCache().createPhoneCallCache(callId)
                .then(
                    function (call:PhoneCallCacheModel)
                    {
                        var sds:PhoneCallCacheModel = new PhoneCallCacheModel(call);
                        res.json('OK');
                    }
                );

           /* new  PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
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
            /*var ttt = new TimeJobDelegate().scheduleJobs()
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

        //ONLY FOR TESTING
        //TODO remove this after testing
        app.post(TwilioUrlDelegate.twimlGenerateCall(), function (req:express.Request, res:express.Response)
        {
            self.TimeJobDelegate.getScheduledJobs();
            res.json("OK");
        });
    }
}
export = TwimlOutApi

