///<reference path='../_references.d.ts'/>
///<reference path='./ApiConstants.ts'/>
///<reference path='../delegates/IntegrationMemberDelegate.ts'/>
///<reference path='../delegates/PhoneCallDelegate.ts'/>
///<reference path='../delegates/calling/TwilioDelegate.ts'/>
///<reference path='../delegates/ApiUrlDelegate.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../common/Config.ts'/>
///<reference path='../models/PhoneCall.ts'/>
///<reference path='../models/User.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../enums/ApiFlags.ts'/>
var json2xml = require('json2xml');

module api
{
    export class TwimlApi
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
            app.get(delegates.ApiUrlDelegate.twiml(), function (req, res)
            {
                var response = {
                    'Response': [
                        {
                            'Gather': {'Say': 'Please enter the call id followed by star key'},
                            'attr': {
                                'action': req.protocol + "://" + req.get('host') + delegates.ApiUrlDelegate.twimlJoinConference(),
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

            app.get(delegates.ApiUrlDelegate.twimlJoinConference(), function (req, res)
            {
                var callId = parseInt(req.query[TwimlApi.PARAM_DIGITS]);
                var expert:models.IntegrationMember, user:models.User;
                ;

                new delegates.PhoneCallDelegate().get(callId, null, [enums.ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER])
                    .then(
                    function callFetched(call:models.PhoneCall)
                    {
                        expert = call[enums.ApiFlags.INCLUDE_INTEGRATION_MEMBER_USER];
                        user = expert[enums.ApiFlags.INCLUDE_USER];
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
                        return new delegates.TwilioDelegate().makeCall(user.getMobile(), req.protocol + "://" + req.get('host') + delegates.ApiUrlDelegate.twimlCall(callId));
                    });
            });

            app.post(delegates.ApiUrlDelegate.twimlCall(), function (req, res)
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
}