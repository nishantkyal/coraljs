///<reference path='../api/ApiConstants'/>;
///<reference path='../delegates/ApiUrlDelegate'/>;
///<reference path='../delegates/SMSDelegate'/>;
///<reference path='../middleware/AccessControl'/>;
///<reference path='../models/SMS'/>;

class SMSApi
{
    constructor(app)
    {
        var smsDelegate = new SMSDelegate();

        app.post(delegates.ApiUrlDelegate.sms(), AccessControl.allowDashboard, function(req, res)
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