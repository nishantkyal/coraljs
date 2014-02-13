///<reference path='../_references.d.ts'/>
import express                      = require('express');
import json2xml                     = require('json2xml');
import ApiConstants                 = require('../enums/ApiConstants');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import TwilioDelegate               = require('../delegates/calling/TwilioDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate');
import ApiUrlDelegate               = require('../delegates/ApiUrlDelegate');
import Utils                        = require('../common/Utils');
import Config                       = require('../common/Config');
import PhoneCall                    = require('../models/PhoneCall');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import IncludeFlag                  = require('../enums/IncludeFlag');

class TwimlApi
{
    private static ROOT:string = 'Response';
    private static VERB_SAY:string = 'Say';
    private static VERB_PLAY:string = 'Play';
    private static VERB_DIAL:string = 'Dial';
    private static VERB_RECORD:string = 'Record';
    private static VERB_GATHER:string = 'Gather';
    private static VERB_SMS:string = 'Sms';
    private static VERB_HANGUP:string = 'Hangup';
    private static VERB_QUEUE:string = 'Queue';
    private static VERB_REDIRECT:string = 'Redirect';
    private static VERB_PAUSE:string = 'Pause';
    private static VERB_REJECT:string = 'Reject';

    private static PARAM_DIGITS:string = 'Digits';

    constructor(app)
    {
        app.get(ApiUrlDelegate.twiml(), function (req:express.Request, res:express.Response)
        {
            var response = {
                'Response': [
                    {
                        'Gather': {'Say': 'Please enter the call id followed by star key'},
                        'attr': {
                            'action': req.protocol + "://" + req.get('host') + ApiUrlDelegate.twimlJoinConference(),
                            'method': 'GET',
                            'finishOnKey': '*'
                        }
                    }
                ]
            };

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                .header('Content-type', 'application/xml')
                .send(json2xml(response, {header: true, attributes_key: 'attr'}));
        });

        app.get(ApiUrlDelegate.twimlJoinConference(), function (req:express.Request, res:express.Response)
        {
            var callId = parseInt(req.query[TwimlApi.PARAM_DIGITS]);
            var expert:IntegrationMember, user:User;
            ;

            new PhoneCallDelegate().get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER_USER])
                .then(
                function callFetched(call:PhoneCall)
                {
                    expert = call[IncludeFlag.INCLUDE_INTEGRATION_MEMBER_USER];
                    user = expert[IncludeFlag.INCLUDE_USER];
                    return {
                        'Response': [
                            {
                                'Say': 'Please wait while get Mr. ' + user.getFirstName() + ' ' + user.getLastName() + ' on the call'
                            },
                            {
                                'Dial': {
                                    'Conference': call.getId()
                                }
                            }
                        ]
                    };
                },
                function callFetchError(error)
                {
                    return {
                        'Response': {
                            'Say': 'Invalid call id entered. Please check and try again'
                        }
                    }
                })
                .then(
                function responseGenerated(response)
                {
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                        .header('Content-type', 'application/xml')
                        .send(json2xml(response, {header: true, attributes_key: 'attr'}));
                })
                .then(
                function responseSent()
                {
                    return new TwilioDelegate().makeCall(user.getMobile(), req.protocol + "://" + req.get('host') + ApiUrlDelegate.twimlCall(callId));
                });
        });

        app.post(ApiUrlDelegate.twimlCall(), function (req:express.Request, res:express.Response)
        {
            var callId:number = req.params[ApiConstants.PHONE_CALL_ID];

            // TODO: Validate call id
            var response = {
                'Response': {
                    'Dial': {
                        'Conference': callId
                    }
                }
            };

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                .header('Content-type', 'application/xml')
                .send(json2xml(response, {header: true, attributes_key: 'attr'}));
        });

    }


}
export = TwimlApi