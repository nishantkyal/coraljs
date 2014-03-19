import ScheduledTask                                        = require('../../models/tasks/ScheduledTask');
import EmailDelegate                                        = require('../../delegates/EmailDelegate');
import ScheduledTaskType                                    = require('../../enums/ScheduledTaskType');

class EmailScheduledTask extends ScheduledTask
{
    execute()
    {
        var emailDelegate = new EmailDelegate();

        switch(this.getTaskType())
        {
            case ScheduledTaskType.EMAIL_MOBILE_VERIFICATION_REMINDER:
                emailDelegate.sendMobileVerificationReminderEmail.apply(this, this.getArgs());
        }
    }

    isValid():boolean
    {
        return super.isValid();
    }
}
export = EmailScheduledTask