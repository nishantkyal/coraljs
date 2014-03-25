///<reference path='../../_references.d.ts'/>
import q                                = require('q');
import log4js                           = require('log4js');
import Utils                            = require('../../common/Utils');
import ICallingVendorDelegate           = require('./ICallingVendorDelegate');
import ApiUrlDelegate                   = require('../ApiUrlDelegate');
import TwilioUrlDelegate                = require('../../delegates/TwilioUrlDelegate');
import Config                           = require('../../common/Config');
import CallFragment                     = require('../../models/CallFragment');
import CallFragmentStatus               = require('../../enums/CallFragmentStatus');
import AgentType                        = require('../../enums/AgentType');
import TwilioConstants                  = require('../../enums/TwilioConstants');


class TwilioDelegate implements ICallingVendorDelegate
{
    logger:log4js.Logger;
    twilioClient:any;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.twilioClient = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));
    }

    sendSMS(to:string, body:string, from?:string):q.Promise<any>
    {
        var deferred = q.defer();
        this.twilioClient.sendMessage({

            to: to,
            from: Config.get('twilio.number'),
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
        var self = this;
        var url:string = TwilioUrlDelegate.INFOLLION_URL + TwilioUrlDelegate.twimlJoinCall(callId);
        var callbackUrl:string = TwilioUrlDelegate.INFOLLION_URL + TwilioUrlDelegate.twimlCallback(callId);

        if(!Utils.isNullOrEmpty(reAttempts) && reAttempts != 0)
        {
            url += '?' + TwilioConstants.ATTEMPT_COUNT + '=' + reAttempts;
            callbackUrl += '?' + TwilioConstants.ATTEMPT_COUNT + '=' + reAttempts;
        }

        var deferred = q.defer();
        this.twilioClient.makeCall({

            to : phone,
            from : Config.get('twilio.number'),
            url  : url,
            method: "GET",
            StatusCallback: callbackUrl
        }, function (err, responseData)
        {
            if (!err){
                self.logger.info("Call made to number:" + phone + " callId:" + callId);
                deferred.resolve(responseData);
            }
            else{
                self.logger.info("Call could not made to number:" + phone + " callId:" + callId);
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }

    updateCallFragment(callFragment:CallFragment):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer();
        this.twilioClient.calls(callFragment.getAgentCallSidExpert()).get(// get details calls made to expert
            function(err, callDetails)
            {
                if(!Utils.isNullOrEmpty(callDetails))
                {
                    var duration:number = parseInt(callDetails[TwilioConstants.DURATION_CALLBACK]);
                    var startTime:Date = new Date(callDetails[TwilioConstants.START_TIME]);
                    callFragment.setDuration(duration);
                    callFragment.setStartTime(moment(startTime).valueOf());
                    callFragment.setToNumber(callDetails[TwilioConstants.EXPERT_NUMBER]);
                    callFragment.setAgentId(AgentType.TWILIO);
                    if (callDetails[TwilioConstants.STATUS] == TwilioConstants.COMPLETED)
                        if(duration < Config.get('minimum.duration.for.success'))
                            callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_MINIMUM_DURATION);
                        else
                            callFragment.setCallFragmentStatus(CallFragmentStatus.SUCCESS);
                    else
                        callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_EXPERT_ERROR);
                    deferred.resolve(callFragment);
                }
                else
                    deferred.reject(err);
            });
        return deferred.promise;
    }

    updateCallFragmentStartTime(callFragment:CallFragment):q.Promise<any>
    {
        var self = this;
        var deferred = q.defer();
        this.twilioClient.calls(callFragment.getAgentCallSidUser()).get(//get details of call made to user
            function(err, callDetails)
            {
                if(!Utils.isNullOrEmpty(callDetails))
                {
                    var startTime:Date = new Date(callDetails[TwilioConstants.START_TIME]);
                    callFragment.setStartTime(moment(startTime).valueOf());
                    deferred.resolve(callFragment);
                }
                else
                    deferred.reject(err);
            });
        return deferred.promise;
    }
}

export = TwilioDelegate