import express                      = require('express');
import ApiConstants                 = require('../enums/ApiConstants');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');
import PhoneCallDelegate            = require('../delegates/PhoneCallDelegate')
import ApiUrlDelegate               = require('../delegates/ApiUrlDelegate');
import User                         = require('../models/User');
import IntegrationMember            = require('../models/IntegrationMember');
import PhoneCall                    = require('../models/PhoneCall');
import IncludeFlag                     = require('../enums/IncludeFlag');


class ExotelApi
{
    private static PARAM_DIGITS:string = 'digits';
    private static CALL_SID:string = 'CallSid';
    private static CALLER_ID:string = 'From';
    private static CALL_TIME:string = "StartTime";

    constructor(app, secureApp)
    {
        app.get(ApiUrlDelegate.exotel(), function (req:express.Request, res:express.Response)
        {
            var receivedIdString:string = req.query[ExotelApi.PARAM_DIGITS];
            if (receivedIdString)
            {
                receivedIdString = receivedIdString.replace(/"/g, '');
                receivedIdString = receivedIdString.split(' ')[0];
                var callId:number = parseInt(receivedIdString);
                var callerNumber:number = parseInt(req.query[ExotelApi.CALLER_ID]);
                var exotelCallId:string = req.query[ExotelApi.CALL_SID]; // as it can contain '.'
                var callTime:Date = new Date(req.query[ExotelApi.CALL_TIME]);
                var expert:IntegrationMember, user:User;

                if (callId && callerNumber && exotelCallId && callTime)
                {
                    new PhoneCallDelegate().get(callId, null, [PhoneCall.FK_PHONE_CALL_EXPERT])
                        .then(
                        function callFetched(call:PhoneCall)
                        {
                            //need to save exotelCallId as it will be used to send expert number afterwards
                            expert = call[IncludeFlag.INCLUDE_INTEGRATION_MEMBER];
                            user = expert[IncludeFlag.INCLUDE_USER];
                            res.json('OK');
                        },
                        function callFetchError(error) { res.status(401).json(error); }
                    )
                }
                else
                    res.status(500).json('Invalid Data');
            }
            else
                res.status(500).json('Invalid Data');
        });

        app.get(ApiUrlDelegate.exotelAddExpert(), function (req:express.Request, res:express.Response)
        {
            var exotelCallId:string = req.query[ExotelApi.CALL_SID]; // as it can contain '.'

            if (true) // check whether exotelCallId exists in cache and is yes then  get expert number from it
            {
                var expertNumber:number = 1111111111 ;
                res.json(expertNumber); //Send mobile number here
            }
            else
                res.status(500).json('Something Went Wrong!!');
        });
    }
}
export = ExotelApi