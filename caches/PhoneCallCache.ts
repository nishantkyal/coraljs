import q                            = require('q');
import log4js                       = require('log4js');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');
import CacheHelper                  = require('./CacheHelper');
import UserPhoneDelegate            = require('../delegates/UserPhoneDelegate');
import CallFragmentDelegate         = require('../delegates/CallFragmentDelegate');
import PhoneCall                    = require('../models/PhoneCall');
import PhoneCallCacheModel          = require('./models/PhoneCallCacheModel');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import UserPhone                    = require('../models/UserPhone');
import ApiFlags                     = require('../enums/ApiFlags');
import PhoneType                    = require('../enums/PhoneType');


class PhoneCallCache
{
    logger:log4js.Logger;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    createPhoneCallCache(callId:number):q.Promise<any>
    {
        var self = this;
        var phoneCallCache:PhoneCallCacheModel = new PhoneCallCacheModel();
        var key:string = 'callId-' + callId;
        var secondsInAnHr:number = 60 * 60; //for expiry
        var expert:IntegrationMember, user:User,call:PhoneCall;
        var user_phone_id:number,  expert_phone_id:number;
        var PhoneCallDelegate = require('../delegates/PhoneCallDelegate');
        return new PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
            .then(
            function callFetched(tempCall:PhoneCall)
            {
                call = tempCall;
                user_phone_id = tempCall.getCallerPhoneId();
                expert_phone_id = tempCall.getExpertPhoneId();
                expert = tempCall[ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER];
                user = expert[ApiFlags.INCLUDE_USER];
                return new UserPhoneDelegate().get(expert_phone_id);
            })
            .then(
            function PhoneRecord(expertPhone:UserPhone)
            {
                new UserPhoneDelegate().get(user_phone_id)
                    .then(
                    function PhoneRecordUser(userPhone:UserPhone)
                    {
                        var expertNumber:string = '+' + expertPhone.getCountryCode();
                        if(expertPhone.getType() == PhoneType.LANDLINE)
                            expertNumber += expertPhone.getAreaCode();
                        expertNumber += expertPhone.getPhone();

                        var userNumber:string = '+' + userPhone.getCountryCode();
                        if(userPhone.getType() == PhoneType.LANDLINE)
                            userNumber += userPhone.getAreaCode();
                        userNumber += userPhone.getPhone();

                        phoneCallCache.setCallId(callId);
                        phoneCallCache.setCallerUserId(call.getCallerUserId());
                        phoneCallCache.setIntegrationMemberId(call.getIntegrationMemberId());
                        phoneCallCache.setUserNumber(userNumber);
                        phoneCallCache.setUserPhoneType(userPhone.getType());
                        phoneCallCache.setExpertNumber(expertNumber);
                        phoneCallCache.setExpertPhoneType(expertPhone.getType());
                        phoneCallCache.setStartTime(call.getStartTime());
                        phoneCallCache.setStatus(call.getStatus());
                        phoneCallCache.setRecorded(call.getRecorded());
                        phoneCallCache.setExtension(call.getExtension());
                        phoneCallCache.setNumReattempts(call.getNumReattempts());
                        phoneCallCache.setDelay(call.getDelay());
                        phoneCallCache.setExpertName(user.getFirstName() + ' ' + user.getLastName());
                    })
                    .then(
                    function getDuration(){
                        return new CallFragmentDelegate().getTotalDuration(callId)
                    })
                    .then(
                    function cachePhoneCall(totalDuration:number){
                        //TODO decide what to do when not enough call time remains. How to notify the user?
                        phoneCallCache.setDuration(call.getDuration() - totalDuration[0].totalDuration);
                        return CacheHelper.set(key , phoneCallCache, secondsInAnHr);
                    })
            })
            .fail(
            function(error){
                self.logger.debug("Error in caching PhoneCall");
            })
    }

    getPhoneCall(callId:number):q.Promise<any>
    {
        return CacheHelper.get('callId-' + callId);
    }

}
export = PhoneCallCache