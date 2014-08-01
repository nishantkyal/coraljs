import q                            = require('q');
import express                      = require('express');
import moment                       = require('moment');
import Utils                        = require('../common/Utils');
import log4js                       = require('log4js');
import Config                       = require('../common/Config');
import AgentType                    = require('../enums/AgentType');
import CallStatus                   = require('../enums/CallStatus');
import CallFragment                 = require('../models/CallFragment');
import PhoneCall                    = require('../models/PhoneCall');
import KookooUrlDelegate            = require('../delegates/KookooUrlDelegate');
import CallFragmentDelegate         = require('../delegates/CallFragmentDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate');
import PhoneCallCache               = require('../caches/PhoneCallCache');

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
    private phoneCallDelegate;
    private callFragmentDelegate;
    private phoneCallCache;

    constructor(app)
    {
        var self = this;
        self.logger = log4js.getLogger(Utils.getClassName(this));
        self.callFragmentDelegate = new CallFragmentDelegate();
        self.phoneCallDelegate = new PhoneCallDelegate();
        self.phoneCallCache = new PhoneCallCache();

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
            var pageData = {};
            var event = req.query[KookooApi.EVENT];
            self.logger.info("Kookoo Callback received. Event - " + event);
            switch(event)
            {
                case KookooApi.EVENT_NEW_CALL:
                    pageData['message'] = 'Please Enter your Call I.D. followed by hash';
                    res.render('kookoo/KookooXMLDTMF.jade',pageData );
                    break;

                case KookooApi.EVENT_DTMF:
                    var callId:number = parseInt(req.query[KookooApi.DATA]);
                    self.logger.info('Kookoo callback - callId received = ' + callId);
                    self.evaluateDTMFInput(callId, req, res);
                    break;

                case KookooApi.EVENT_DISCONNECT:
                case KookooApi.EVENT_HANGUP:
                    var duration:number = parseInt(req.query[KookooApi.CALL_DURATION]);
                    var startTime:number = moment().valueOf() - duration * 1000;
                    res.render('kookoo/KookooXMLHangup.jade',pageData ); // after user hang ups, send hang up command to kookoo as mentioned in Docs
                    self.callFragmentDelegate.update({'agent_call_sid_user':req.query[KookooApi.SID]}, {'start_time':startTime, 'duration':duration});
                    break;
                default:
                    res.render('kookoo/KookooXMLHangup.jade',pageData );
            }
        });
    }

    evaluateDTMFInput(callId:number,req:express.Request, res:express.Response)
    {
        var self = this;
        var pageData = {};
        if(!Utils.isNullOrEmpty(callId))
        {
            self.phoneCallDelegate.get(callId)
                .then(
                function CallFetched(call:PhoneCall){
                    var startTime:number = call.getStartTime() + (call.getDelay() || 0);

                    var validStartTime:boolean = (startTime < moment().valueOf());
                    var validDelay:boolean = (startTime + (Config.get(Config.MAXIMUM_CALLBACK_DELAY) * 1000)) > moment().valueOf();
                    var validStatus:boolean = (call.getStatus() == CallStatus.IN_PROGRESS);

                    if (validStartTime && validStatus && validDelay )
                    {
                        pageData['message'] = 'Call I.D. Confirmed. We will reconnect the Call.';

                        var tempCall:PhoneCall = new PhoneCall(); // to update db -> create tempCall and set new delay value in it
                        call.setDelay((call.getDelay() || 0) + (moment().valueOf() - call.getStartTime())/1000 + Config.get(Config.DELAY_AFTER_CALLBACK));
                        tempCall.setDelay(call.getDelay());

                        q.all([
                            self.phoneCallDelegate.update(callId,tempCall),
                            self.phoneCallCache.addCall(call,null,true)
                        ])
                        .then( function callUpdated(){
                            self.phoneCallDelegate.queueCallForTriggering(callId);
                        })
                    }
                    else if (validStartTime && validStatus && !validDelay)
                        pageData['message'] = 'You did not notify us in scheduled time. The call has been cancelled.';
                    else if (validStartTime && !validStatus) //if status is not valid then validity of delay does not matter
                        pageData['message'] = 'Call Status not correct to retry the call. There might have been an error in call triggering. We will retry in some time';
                        //this case means that call was time has gone but call was not made at all or there was an error in status update.
                    else if(!validStartTime)
                        pageData['message'] = 'Call already scheduled and will be made on scheduled time';

                    res.render('kookoo/KookooXMLEnd.jade',pageData );

                    var callFragment:CallFragment = new CallFragment();
                    callFragment.setCallId(callId);
                    callFragment.setAgentCallSidUser(req.query[KookooApi.SID]);
                    callFragment.setFromNumber(req.query[KookooApi.CID]);
                    callFragment.setAgentId(AgentType.KOOKOO);
                    self.callFragmentDelegate.create(callFragment); // save the call fragment
                })
                .fail(function(error){
                    var pageData = {};
                    pageData['message'] = 'Could not find the Call for I.D. entered. Please Try Again. Enter your Call I.D. followed by hash';
                    res.render('kookoo/KookooXMLDTMF.jade',pageData );
                })
        }
        else
        {
            var pageData = {};
            pageData['message'] = 'You did not enter a Call I.D. Please Enter your Call I.D. followed by hash';
            res.render('kookoo/KookooXMLDTMF.jade',pageData );
        }
    }
}
export = KookooApi