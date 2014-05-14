import ScheduledTaskType                                        = require('../enums/ScheduledTaskType');
import AbstractScheduledTask                                    = require('../models/tasks/AbstractScheduledTask');
import TriggerPhoneCallTask                                     = require('../models/tasks/TriggerPhoneCallTask');
import PrintTimestampTask                                       = require('../models/tasks/PrintTimestampTask');
import NotificationCallScheduledTask                            = require('../models/tasks/NotificationCallScheduledTask');
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
                break;

            case ScheduledTaskType.CALL_REMINDER_NOTIFICATION:
                return new NotificationCallScheduledTask(result[TriggerPhoneCallTask.CALL_ID]);
                break;

            case ScheduledTaskType.EMAIL_MOBILE_VERIFICATION_REMINDER:
                return null;
                break;

            case ScheduledTaskType.SMS:
                return null;
                break;

            case ScheduledTaskType.TEST_TIMESTAMP_PRINT:
                return new PrintTimestampTask(result[PrintTimestampTask.ts]);
                break;

            default:
                return null;
        }
    }
}
export = TaskTypeFactory