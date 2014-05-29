import q                                                        = require('q');
import _                                                        = require('underscore');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');

class NotificationCallScheduledTask extends AbstractScheduledTask
{
    private callId:number;

    constructor(callId:number)
    {
        this.callId = callId;
        this.setTaskType(ScheduledTaskType.CALL_REMINDER_NOTIFICATION);
        super();
    }

    execute():q.Promise<any>
    {
        var NotificationDelegate  = require('../../delegates/NotificationDelegate');
        return new NotificationDelegate().sendCallReminderNotification(this.callId);
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.callId);
    }

    toJson():Object
    {
        return _.extend(super.toJson(),{callId:this.callId});
    }
}
export = NotificationCallScheduledTask