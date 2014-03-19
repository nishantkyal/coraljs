import express                      = require('express');
import Utils                        = require('../common/Utils');
import log4js                       = require('log4js');
import Config                       = require('../common/Config');
import AgentType                    = require('../enums/AgentType');
import CallFragment                 = require('../models/CallFragment');
import KookooUrlDelegate            = require('../delegates/KookooUrlDelegate');
import CallFragmentDelegate         = require('../delegates/CallFragmentDelegate');
import TimeJobDelegate              = require('../delegates/TimeJobDelegate');
import PhoneCallCache               = require('../caches/PhoneCallCache')
import PhoneCallCacheModel          = require('../caches/models/PhoneCallCacheModel');

class KookooApi
{
    private static EVENT:string = 'event';
    private static DATA:string = 'data';
    private static SID:string = 'sid';
    private static CID:string = 'cid';
    private static CALL_DURATION:string = 'total_call_duration';
    private static EVENT_NEW_CALL:string = 'NewCall';
    private static EVENT_DTMF:string = 'GotDTMF';
    private static EVENT_RECORD:string = 'Record';
    private static EVENT_HANGUP:string = 'Hangup';
    private static EVENT_DIAL:string = 'Dial';
    private static EVENT_DISCONNECT:string = 'Disconnect';
    private static RESCHEDULE_DURATION:number = 60000; //1 min

    private logger:log4js.Logger;
    private PhoneCallCache;
    private CallFragmentDelegate;

    constructor(app)
    {
        var self = this;
        self.logger = log4js.getLogger(Utils.getClassName(this));
        self.PhoneCallCache = new PhoneCallCache();
        self.CallFragmentDelegate = new CallFragmentDelegate();

        /*
        Kookoo call the same url again and again with different event tags (in query).
        -- New call event is send first and we respond by asking user to enter CallId
        -- User enter callId and that data is sent to us. We check whether that callId exists in cache(i.e. it was scheduled or not)
           and then we check whether any call fragment exist for that callId.
           -- If yes then we reschedule the call
           -- if no then we tell user that call is scheduled
        -- after user hangs up, hangup event is send and we send hangup in return
         */
        app.get(KookooUrlDelegate.kookooCallback(), function (req:express.Request, res:express.Response){
            self.logger.info("Kookoo received a call");
            self.logger.info(req.originalUrl);
            var pageData = {};
            var event = req.query[KookooApi.EVENT];
            switch(event)
            {
                case KookooApi.EVENT_NEW_CALL:
                    pageData['message'] = 'Please Enter your Call I.D. followed by hash';
                    res.render('../delegates/calling/KookooXMLDTMF.jade',pageData );
                    break;

                case KookooApi.EVENT_DTMF:
                    var callId:number = parseInt(req.query[KookooApi.DATA]);
                    self.evaluateDTMFInput(callId, req, res);
                    break;

                case KookooApi.EVENT_DISCONNECT:
                case KookooApi.EVENT_HANGUP:
                    var duration:number = parseInt(req.query[KookooApi.CALL_DURATION]);
                    var startTime:number = new Date().getTimeInSec() - duration;
                    res.render('../delegates/calling/KookooXMLHangup.jade',pageData ); // after user hang ups, send hang up command to kookoo as mentioned in Docs
                    self.CallFragmentDelegate.update({'agent_call_sid_user':req.query[KookooApi.SID]}, {'start_time':startTime, 'duration':duration});
                    break;
            }
        });
    }

    evaluateDTMFInput(callId:number,req:express.Request, res:express.Response)
    {
        var self = this;
        var pageData = {};
        if(!Utils.isNullOrEmpty(callId))
        {
            self.PhoneCallCache.getPhoneCall(callId)
                .then(
                function CallFetched(call:any){
                    if(!Utils.isNullOrEmpty(call))
                    {
                        return self.CallFragmentDelegate.search({'call_id':callId});
                    }
                    else
                        throw new Error("Call Id not Found");
                })
                .then(
                function CallFragmentFetched(callFragments:CallFragment[]){
                    if(callFragments.length != 0) // no calLFragment exist for this callId and thus the call has not been initiated from our side.
                    {
                        pageData['message'] = 'Call I.D. Confirmed. We will reconnect the Call.';
                        new TimeJobDelegate().rescheduleJob(callId, KookooApi.RESCHEDULE_DURATION);
                    }
                    else
                        pageData['message'] = 'The Call is already scheduled and will be made on scheduled time.';
                    res.render('../delegates/calling/KookooXMLEnd.jade',pageData );
                    var callFragment:CallFragment = new CallFragment();
                    callFragment.setCallId(callId);
                    callFragment.setAgentCallSidUser(req.query[KookooApi.SID]);
                    callFragment.setFromNumber(req.query[KookooApi.CID]);
                    callFragment.setAgentId(AgentType.KOOKOO);
                    self.CallFragmentDelegate.create(callFragment); // save the call fragment
                })
                .fail(function(error){
                    var pageData = {};
                    pageData['message'] = 'Could not find the Call for I.D. entered. Please Try Again';
                    res.render('../delegates/calling/KookooXMLDTMF.jade',pageData );
                })
        }
        else
        {
            var pageData = {};
            pageData['message'] = 'You did not enter a Call I.D. Please Enter your Call I.D. followed by hash';
            res.render('../delegates/calling/KookooXMLDTMF.jade',pageData );
        }
    }
}
export = KookooApi