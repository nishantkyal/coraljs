import ScheduledTaskType                                        = require('../enums/ScheduledTaskType');
import AbstractScheduledTask                                    = require('../models/tasks/AbstractScheduledTask');
import TriggerPhoneCallTask                                     = require('../models/tasks/TriggerPhoneCallTask');
import PrintTimestampTask                                       = require('../models/tasks/PrintTimestampTask');
import NotificationCallScheduledTask                            = require('../models/tasks/NotificationCallScheduledTask');
import ScheduleCallsScheduledTask                               = require('../models/tasks/ScheduleCallsScheduledTask');
import SMSDelegate                                              = require('../delegates/SMSDelegate');

class TaskTypeFactory
{
    private static tasks:{[id:number]: AbstractScheduledTask} = {};

    static getTask(result):AbstractScheduledTask
    {
        switch(result[AbstractScheduledTask.TASKTYPE])
        {
            case ScheduledTaskType.CALL:
                return new TriggerPhoneCallTask(result[TriggerPhoneCallTask.CALL_ID])

            case ScheduledTaskType.CALL_REMINDER_NOTIFICATION:
                return new NotificationCallScheduledTask(result[TriggerPhoneCallTask.CALL_ID]);

            case ScheduledTaskType.EMAIL_MOBILE_VERIFICATION_REMINDER:
                return null;

            case ScheduledTaskType.CALL_SCHEDULE:
                return new ScheduleCallsScheduledTask();

            case ScheduledTaskType.TEST_TIMESTAMP_PRINT:
                return new PrintTimestampTask(result[PrintTimestampTask.ts]);

            default:
                return null;
        }
    }
}
export = TaskTypeFactory