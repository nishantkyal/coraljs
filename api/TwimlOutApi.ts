import express                      = require('express');
import json2xml                     = require('json2xml');
import ApiConstants                 = require('../enums/ApiConstants');
import ApiFlags                     = require('../enums/ApiFlags');
import AgentType                    = require('../enums/AgentType');
import PhoneType                    = require('../enums/PhoneType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import TwilioDelegate               = require('../delegates/calling/TwilioDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate');
import UserPhoneDelegate            = require('../delegates/UserPhoneDelegate');
import ApiUrlDelegate               = require('../delegates/ApiUrlDelegate');
import CallFragmentDelegate         = require('../delegates/CallFragmentDelegate');
import SMSDelegate                  = require('../delegates/SMSDelegate');
import Utils                        = require('../common/Utils');
import Config                       = require('../common/Config');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import UserPhone                    = require('../models/UserPhone');
import CallFragment                 = require('../models/CallFragment');

class TwimlOutApi
{
    private static DIALCALLSID:string = 'DialCallSid';
    private static DURATION:string = 'duration';
    private static CALLSID:string = 'CallSid';
    private static USERNUMBER:string = 'To';
    private static STARTTIME:string = 'start_time';
    private static EXPERTNUMBER:string = 'to';


    constructor(app)
    {
        app.get(ApiUrlDelegate.twimlGenerateCall(), function (req:express.Request, res:express.Response)
        {
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var url:string = req.protocol + "://" + req.get('host') + ApiUrlDelegate.twimlJoinCall(callId);
            res.json(new PhoneCallDelegate().triggerCall(callId, url));
        });

        app.get(ApiUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        {
            console.log('JOIN CALLED');
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var expert:IntegrationMember, user:User;
            new PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
                .then(
                function callFetched(call:PhoneCall)
                {
                    expert = call[ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER];
                    user = expert[ApiFlags.INCLUDE_USER];
                    new UserPhoneDelegate().getByUserId(user.getId())
                        .then(
                        function PhoneRecord(userPhone:UserPhone[])
                        {
                            var phoneNumber:string = '+' + userPhone[0].getCountryCode(); // assuming there is only one entry per userId
                            if(userPhone[0].getType() == PhoneType.LANDLINE)
                                phoneNumber += userPhone[0].getAreaCode();
                            phoneNumber += userPhone[0].getPhone();

                            var pageData = {};
                            pageData['actionURL'] = req.protocol + "://" + req.get('host') + ApiUrlDelegate.twimlJoinCall(callId);
                            pageData['timeLimit'] = call.getDuration();
                            pageData['phoneNumber'] = phoneNumber;
                            pageData['record'] = (call.getRecorded() == false) ? 'false':'true' ;
                            pageData['message'] = 'Please wait while get Mr. ' + user.getFirstName() + ' ' + user.getLastName() + ' on the call';
                            res.render('../delegates/calling/TwilioXMLJoin.jade',pageData );
                        }
                    )
                },
                function callFetchError(error)
                {
                    var pageData = {};
                    pageData['message'] = 'Internal Server Error';
                    res.render('../delegates/calling/TwilioXMLSay.jade',pageData );
                });
        });

        app.post(ApiUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        {
            console.log('JOIN POST CALLED');
            var client = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));

            var pageData = {};
            pageData['message'] = 'Call Completed. Thank you for using our services';
            res.render('../delegates/calling/TwilioXMLSay.jade',pageData );

            //Process the call made info to save into call fragment
            var callFragment:CallFragment = new CallFragment();
            callFragment.setCallId(parseInt(req.params[ApiConstants.PHONE_CALL_ID]));
            callFragment.setAgentCallSidExpert(req.body[TwimlOutApi.DIALCALLSID]);
            callFragment.setAgentCallSidUser(req.body[TwimlOutApi.CALLSID]);
            callFragment.setFromNumber(req.body[TwimlOutApi.USERNUMBER]);
            /*client.calls("CA136154d9b2f9b5b3a0f8788f5c82d722").get(function(err, callUser)
            {
                console.log('test');
            });*/
            client.calls(callFragment.getAgentCallSidExpert()).get(function(err, expertCallDetails){
                if(expertCallDetails)
                {
                    var duration:number = parseInt(expertCallDetails[TwimlOutApi.DURATION]);
                    var startTime:Date = new Date(expertCallDetails[TwimlOutApi.STARTTIME]);
                    callFragment.setDuration(duration);
                    callFragment.setStartTime(startTime.getTimeInSec());
                    callFragment.setToNumber(expertCallDetails[TwimlOutApi.EXPERTNUMBER]);
                    callFragment.setAgentId(AgentType.TWILIO);
                    if(duration < Config.get('minimum.duration.for.success'))
                        callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_MINIMUM_DURATION);
                        //TODO call again with IVR
                    else
                    {
                        callFragment.setCallFragmentStatus(CallFragmentStatus.SUCCESS);

                    }
                    new CallFragmentDelegate().create(callFragment);
                }
                else
                    console.log('Error in getting call details');
            });
        });
    }


}
export = TwimlOutApi