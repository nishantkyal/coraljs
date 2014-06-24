///<reference path='../_references.d.ts'/>
import q                                                        = require('q');
import log4js                                                   = require('log4js');
import twilio                                                   = require('twilio');
import moment                                                   = require('moment');
import Utils                                                    = require('../common/Utils');
import ApiUrlDelegate                                           = require('../delegates/ApiUrlDelegate');
import TwilioUrlDelegate                                        = require('../delegates/TwilioUrlDelegate');
import Config                                                   = require('../common/Config');
import Credentials                                              = require('../common/Credentials');
import CallFragment                                             = require('../models/CallFragment');
import UserPhone                                                = require('../models/UserPhone');
import CallFragmentStatus                                       = require('../enums/CallFragmentStatus');
import AgentType                                                = require('../enums/AgentType');
import IPhoneCallProvider                                       = require('./IPhoneCallProvider');
import ISmsProvider                                             = require('./ISmsProvider');

class TwilioProvider implements IPhoneCallProvider,ISmsProvider
{
    static DURATION:string                          = 'duration';
    static START_TIME:string                        = 'start_time';
    static EXPERT_NUMBER:string                     = 'to';
    static COMPLETED:string                         = 'completed';
    static BUSY:string                              = 'busy';
    static NO_ANSWER:string                         = 'no-answer';
    static STATUS:string                            = 'status';
    static ATTEMPTCOUNT:string                      = 'attemptCount';

    logger:log4js.Logger;
    twilioClient:any;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.twilioClient = twilio(Credentials.get(Credentials.TWILIO_ACCOUNT_SID), Credentials.get(Credentials.TWILIO_AUTH_TOKEN));
    }

    sendSMS(to:string, body:string, from?:string):q.Promise<any>;
    sendSMS(to:UserPhone, body:string, from?:string):q.Promise<any>;
    sendSMS(to:any, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();
        this.twilioClient.sendMessage({

            to: to,
            from: Credentials.get(Credentials.TWILIO_NUMBER),
            body: body

        }, function (err, responseData)
        {
            if (!err)
                deferred.resolve(responseData);
            else
                deferred.reject(err);
        });
        return deferred.promise;
    }

    makeCall(phone:string, callId?:number, reAttempts?:number):q.Promise<any>
    {
        var url:string = TwilioUrlDelegate.twimlJoinCall(callId, Credentials.get(Credentials.TWILIO_URI));
        var callbackUrl:string = TwilioUrlDelegate.twimlCallback(callId, Credentials.get(Credentials.TWILIO_URI));

        if(!Utils.isNullOrEmpty(reAttempts))
        {
            url += '?' + TwilioProvider.ATTEMPTCOUNT + '=' + reAttempts;
            callbackUrl += '?' + TwilioProvider.ATTEMPTCOUNT + '=' + reAttempts;
        }

        this.logger.info('Call being made to ' + phone +' . CallId: ' + callId);
        var deferred = q.defer();

        this.twilioClient.makeCall({

            to : phone,
            from : Credentials.get(Credentials.TWILIO_NUMBER),
            url  : url,
            method: "GET",
            StatusCallback: callbackUrl
        }, function (err, responseData)
        {
            if (!err)
                deferred.resolve(responseData);
            else
                deferred.reject(err);
        });

        return deferred.promise;
    }

    updateCallFragment(callFragment:CallFragment):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer();

        if(!Utils.isNullOrEmpty(callFragment.getAgentCallSidExpert()))
        {
            this.twilioClient.calls(callFragment.getAgentCallSidExpert()).get(
                function(err, callDetails)
                {
                    if(!Utils.isNullOrEmpty(callDetails))
                    {
                        var duration:number = parseInt(callDetails[TwilioProvider.DURATION]);
                        var startTime:Date = new Date(callDetails[TwilioProvider.START_TIME]);
                        callFragment.setDuration(duration);
                        callFragment.setStartTime(moment(startTime).valueOf());
                        callFragment.setToNumber(callDetails[TwilioProvider.EXPERT_NUMBER]);
                        callFragment.setAgentId(AgentType.TWILIO);

                        if (callDetails[TwilioProvider.STATUS] == TwilioProvider.COMPLETED)
                        {
                            if(duration < Config.get(Config.MINIMUM_DURATION_FOR_SUCCESS))
                                callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_MINIMUM_DURATION);
                            else
                                callFragment.setCallFragmentStatus(CallFragmentStatus.SUCCESS);
                        }
                        else
                            callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_EXPERT_ERROR);

                        var CallFragmentDelegate:any  = require('../delegates/CallFragmentDelegate');
                        new CallFragmentDelegate().create(callFragment)
                        .then(
                        function callFragmentCreated(frag) { deferred.resolve(frag); },
                        function callFragmentCreatError(error) { deferred.reject(error); }
                        );
                    }
                    else
                    {
                        deferred.reject(err);
                        self.logger.debug('Error in getting call details');
                    }
                });
        }
        else
            deferred.resolve('No Expert Sid');

        return deferred.promise;
    }
}
export = TwilioProvider