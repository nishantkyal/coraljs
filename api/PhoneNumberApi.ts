import express              = require('express');
///<reference path='./ApiConstants'/>;
///<reference path='../middleware/AccessControl'/>;
///<reference path='../delegates/ApiUrlDelegate'/>;
///<reference path='../delegates/PhoneNumberDelegate'/>;
///<reference path='../models/PhoneNumber'/>;

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
class PhoneNumberApi
{
    constructor(app)
    {
        var phoneNumberDelegate = new PhoneNumberDelegate();

        /* Add phone number */
        app.put(delegates.ApiUrlDelegate.phoneNumber(), AccessControl.allowDashboard, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var phoneNumber:PhoneNumber = req.body[ApiConstants.PHONE_NUMBER];

            if (phoneNumber.isValid())
                phoneNumberDelegate.create(phoneNumber)
                    .then(
                    function handlePhoneNumberCreated(result) { res.json(result); },
                    function handlePhoneNumberCreateFailed(err) { res.json(500).json(err); }
                )
            else
                res.status(500).json('Invalid input');
        });

        /* Search phone number */
        app.get(delegates.ApiUrlDelegate.phoneNumber(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            phoneNumberDelegate.search(req.body[ApiConstants.PHONE_NUMBER])
                .then(
                function handlePhoneNumberSearched(result) { res.json(result); },
                function handlePhoneNumberSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Get phone number by id */
        app.get(delegates.ApiUrlDelegate.phoneNumberById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var phoneNumberId = req.params[ApiConstants.PHONE_NUMBER_ID];

            phoneNumberDelegate.get(phoneNumberId)
                .then(
                function handlePhoneNumberSearched(result) { res.json(result); },
                function handlePhoneNumberSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Update phone number */
        app.post(delegates.ApiUrlDelegate.phoneNumberById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var phoneNumberId:string = req.params[ApiConstants.PHONE_NUMBER_ID];
            var phoneNumber:PhoneNumber = req.body[ApiConstants.PHONE_NUMBER];

            phoneNumberDelegate.update(phoneNumberId, phoneNumber)
                .then(
                function handlePhoneNumberUpdated(result) { res.json(result); },
                function handlePhoneNumberUpdateFailed(err) { res.json(500).json(err); }
            )
        });

        /* Delete phone number */
        app.delete(delegates.ApiUrlDelegate.phoneNumberById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            var phoneNumberId:string = req.params[ApiConstants.PHONE_NUMBER_ID];

            phoneNumberDelegate.delete(phoneNumberId)
                .then(
                function handlePhoneNumberDeleted(result) { res.json(result); },
                function handlePhoneNumberDeleteFailed(err) { res.json(500).json(err); }
            )
        });
    }

}
export = PhoneNumberApi