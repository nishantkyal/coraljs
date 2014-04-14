import PhoneCallDelegate                                        = require('../delegates/PhoneCallDelegate');
import CallStatus                                               = require('../enums/CallStatus');

export function checkStatusUpdate(callId?:number, newStatus?:CallStatus)
{
    new PhoneCallDelegate().update(1, {status: CallStatus.SCHEDULED});
}