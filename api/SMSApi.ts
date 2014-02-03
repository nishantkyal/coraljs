///<reference path='../_references.d.ts'/>
///<reference path='../api/ApiConstants.ts'/>;
///<reference path='../delegates/ApiUrlDelegate.ts'/>;
///<reference path='../delegates/SMSDelegate.ts'/>;
///<reference path='../middleware/AccessControl.ts'/>;
///<reference path='../models/SMS.ts'/>;

module api
{
    export class SmsApi
    {
        constructor(app)
        {
            var smsDelegate = new delegates.SMSDelegate();

            app.post(delegates.ApiUrlDelegate.sms(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var sms:models.SMS = req.body[ApiConstants.SMS];

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
}