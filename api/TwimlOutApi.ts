import express                      = require('express');
import json2xml                     = require('json2xml');
import ApiConstants                 = require('../enums/ApiConstants');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import TwilioDelegate               = require('../delegates/calling/TwilioDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate');
import UserPhoneDelegate            = require('../delegates/UserPhoneDelegate');
import ApiUrlDelegate               = require('../delegates/ApiUrlDelegate');
import Utils                        = require('../common/Utils');
import Config                       = require('../common/Config');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import UserPhone                    = require('../models/UserPhone');
import ApiFlags                     = require('../enums/ApiFlags');

class TwimlOutApi
{
    private static PARAM_DIGITS:string = 'Digits';

    constructor(app)
    {
        app.get(ApiUrlDelegate.twimlGenerateCall(), function (req:express.Request, res:express.Response)
        {
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var url:string = req.protocol + "://" + req.get('host') + ApiUrlDelegate.twimlJoinCall(callId);
            res.json(new PhoneCallDelegate().triggerCall(callId, url));
        });

        app.get(ApiUrlDelegate.twimlJoinCall(), function (req:express.Request, res:express.Response)
        {
            var callId = parseInt(req.params[ApiConstants.PHONE_CALL_ID]);
            var expert:IntegrationMember, user:User;
            var response;
            new PhoneCallDelegate().get(callId, null, [ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
                .then(
                function callFetched(call:PhoneCall)
                {
                    expert = call[ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER];
                    user = expert[ApiFlags.INCLUDE_USER];
                    new UserPhoneDelegate().getByUserId(user.getId())
                        .then(
                            function PhoneRecord(userPhone:UserPhone[])
                            {
                                var phoneNumber:string = '+' + userPhone[0].getCountryCode();
                                if(userPhone[0].getType() == 1) //TODO create model for phone_type
                                    phoneNumber += userPhone[0].getAreaCode();
                                phoneNumber += userPhone[0].getPhone();

                                response = {
                                    'Response': [
                                        {
                                            'Say': 'Please wait while get Mr. ' + user.getFirstName() + ' ' + user.getLastName() + ' on the call'
                                        },
                                        {
                                            'Dial': phoneNumber // assuming there is only one entry per userId
                                        }
                                    ]
                                };
                                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                                    .header('Content-type', 'application/xml')
                                    .send(json2xml(response));
                            }
                        )
                },
                function callFetchError(error)
                {
                    var err = {
                        'Response': [
                            {
                                'Say': 'Internal Server Error'
                            }
                        ]
                    };
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                        .header('Content-type', 'application/xml')
                        .send(json2xml(err));
                });
        });
    }


}
export = TwimlOutApi