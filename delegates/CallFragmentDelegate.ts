import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import CallFragmentDao              = require('../dao/CallFragmentDao');
import CallFragment                 = require('../models/CallFragment');
import AgentType                    = require('../enums/AgentType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');

class CallFragmentDelegate extends BaseDaoDelegate
{
    private static DURATION:string = 'duration';
    private static START_TIME:string = 'start_time';
    private static EXPERT_NUMBER:string = 'to';
    private static COMPLETED:string = 'completed';
    private static BUSY:string = 'busy';
    private static NO_ANSWER:string = 'no-answer';
    private static STATUS:string = 'status';

    getDao():IDao { return new CallFragmentDao();}

    getTotalDuration(callId:number, transaction?:any):q.Promise<any>
    {
        return this.getDao().getTotalDuration(callId, transaction);
    }

    saveCallFragment(callFragment:CallFragment)
    {
        var self = this;
        var twilioClient = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));
        twilioClient.calls(callFragment.getAgentCallSidExpert()).get(
            function(err, callDetails)
            {
                if(!Utils.isNullOrEmpty(callDetails))
                {
                    var duration:number = parseInt(callDetails[CallFragmentDelegate.DURATION]);
                    var startTime:Date = new Date(callDetails[CallFragmentDelegate.START_TIME]);
                    callFragment.setDuration(duration);
                    callFragment.setStartTime(startTime.getTimeInSec());
                    callFragment.setToNumber(callDetails[CallFragmentDelegate.EXPERT_NUMBER]);
                    callFragment.setAgentId(AgentType.TWILIO);
                    if (callDetails[CallFragmentDelegate.STATUS] == CallFragmentDelegate.COMPLETED)
                            if(duration < Config.get('minimum.duration.for.success'))
                                callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_MINIMUM_DURATION);
                            else
                                callFragment.setCallFragmentStatus(CallFragmentStatus.SUCCESS);
                    else
                        callFragment.setCallFragmentStatus(CallFragmentStatus.FAILED_EXPERT_ERROR);

                    self.create(callFragment);
                }
                else
                    self.logger.debug('Error in getting call details');
            });
    }
}
export = CallFragmentDelegate