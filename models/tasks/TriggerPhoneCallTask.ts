import _                                                        = require('underscore');
import q                                                        = require('q');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');

class TriggerPhoneCallTask extends AbstractScheduledTask
{
    static CALL_ID:string = 'callId';

    private callId:number;

    constructor(callId:number)
    {
        super();
        this.callId = callId;
        this.setTaskType(ScheduledTaskType.CALL);
    }

    execute():q.Promise<any>
    {
        var PhoneCallDelegate = require('../../delegates/PhoneCallDelegate');
        return new PhoneCallDelegate().triggerCall(this.callId);
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.callId);
    }

    toJson():Object
    {
        return _.extend(super.toJson(), {callId:this.callId});
    }
}
export = TriggerPhoneCallTask