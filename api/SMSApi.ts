///<reference path='../_references.d.ts'/>
import express                          = require('express');
import ApiConstants                     = require('../enums/ApiConstants');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import SMSDelegate                      = require('../delegates/SMSDelegate');
import AccessControl                    = require('../middleware/AccessControl');
import SMS                              = require('../models/SMS');

class SMSApi
{
    constructor(app)
    {
        var smsDelegate = new SMSDelegate();

        app.post(ApiUrlDelegate.sms(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var sms:SMS = req.body[ApiConstants.SMS];

            if (sms.isValid())
                smsDelegate.send(sms)
                    .then(
                        function smsSent(result) { res.json(result.id); },
                        function smsSendFailed(error) { res.status(500).json(error); }
                    )
            else
                res.send(400, 'Invalid data');
        });
    }
}
export = SMSApi