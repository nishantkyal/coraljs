import ApiConstants                     = require('../api/ApiConstants');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import SMSDelegate                      = require('../delegates/SMSDelegate');
import AccessControl                    = require('../middleware/AccessControl');
import SMS                              = require('../models/SMS');

class SMSApi
{
    constructor(app)
    {
        var smsDelegate = new SMSDelegate();

        app.post(ApiUrlDelegate.sms(), AccessControl.allowDashboard, function(req, res)
        {
            var sms:SMS = req.body[ApiConstants.SMS];

            if (sms.isValid())
                smsDelegate.send(sms)
                    .then(
                        function smsSent(result) { res.json(result.id); },
                        function smsSendFailed(error) { res.status(500).json(error); }
                    )
            else
                res.status(400, 'Invalid data');
        });
    }
}
export = SMSApi