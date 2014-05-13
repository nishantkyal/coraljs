import q                                                        = require('q');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import PhoneCallDelegate                                        = require('../../delegates/PhoneCallDelegate');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');

class TriggerPhoneCallTask extends AbstractScheduledTask
{
    private callId:number;

    constructor(callId:number)
    {
        this.callId = callId;
        this.setTaskType(ScheduledTaskType.CALL);
        super();
    }

    execute():q.Promise<any>
    {
        return new PhoneCallDelegate().triggerCall(this.callId);
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.callId);
    }

}
export = TriggerPhoneCallTask