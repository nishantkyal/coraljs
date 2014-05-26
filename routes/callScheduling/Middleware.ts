import express                                              = require('express');
import ApiConstants                                         = require('../../enums/ApiConstants');
import VerificationCodeDelegate                             = require('../../delegates/VerificationCodeDelegate');
import Utils                                                = require('../../common/Utils');

class Middleware
{
    verifyAppointmentCode(req:express.Request, res:express.Response, next:Function)
    {
        var code:string = req.query[ApiConstants.CODE] || req.body[ApiConstants.CODE];
        new VerificationCodeDelegate().verifyAppointmentAcceptCode(code)
        .then(
            function schedulingDetailsFetched(result)
            {
                if (Utils.isNullOrEmpty(result))
                    res.render('500', {error: 'Invalid request. Please click on one of the links in the email.'});
                else
                    next();
            });
    }
}