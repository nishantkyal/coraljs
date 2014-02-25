///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import EmailDelegate                                        = require('../delegates/EmailDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import User                                                 = require('../models/User');

class EmailApi
{
    constructor(app)
    {
        app.put(ApiUrlDelegate.expertInviteEmail(), function(req:express.Request, res:express.Response)
        {
            var integrationId:number = parseInt(req.body[ApiConstants.INTEGRATION_ID]);
            var user:User = req.body[ApiConstants.USER];

            new EmailDelegate().sendExpertInvitationEmail(integrationId, user)
                .then(
                    function emailSent(result) { res.json(result); },
                    function emailSendError(error) { res.send(500, error); }
                );
        });
    }
}
export = EmailApi