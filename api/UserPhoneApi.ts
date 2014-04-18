import express              = require('express');
import ApiConstants         = require('../enums/ApiConstants');
import AccessControl        = require('../middleware/AccessControl');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');
import UserPhoneDelegate    = require('../delegates/UserPhoneDelegate');
import UserPhone            = require('../models/UserPhone');

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
class UserPhoneApi
{
    constructor(app, secureApp)
    {
        var userPhoneDelegate = new UserPhoneDelegate();

        /* Add phone number */
        app.put(ApiUrlDelegate.UserPhone(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var UserPhone:UserPhone = req.body[ApiConstants.PHONE_NUMBER];

            if (UserPhone.isValid())
                userPhoneDelegate.create(UserPhone)
                    .then(
                    function handleUserPhoneCreated(result) { res.json(result); },
                    function handleUserPhoneCreateFailed(err) { res.json(500).json(err); }
                )
            else
                res.status(500).json('Invalid input');
        });

        /* Search phone number */
        app.get(ApiUrlDelegate.UserPhone(), function(req:express.Request, res:express.Response)
        {
            userPhoneDelegate.search(req.body[ApiConstants.PHONE_NUMBER])
                .then(
                function handleUserPhoneSearched(result) { res.json(result); },
                function handleUserPhoneSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Get phone number by id */
        app.get(ApiUrlDelegate.UserPhoneById(), function(req:express.Request, res:express.Response)
        {
            var UserPhoneId = req.params[ApiConstants.PHONE_NUMBER_ID];

            userPhoneDelegate.get(UserPhoneId)
                .then(
                function handleUserPhoneSearched(result) { res.json(result); },
                function handleUserPhoneSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Update phone number */
        app.post(ApiUrlDelegate.UserPhoneById(), function(req:express.Request, res:express.Response)
        {
            var userPhoneId:number = parseInt(req.params[ApiConstants.PHONE_NUMBER_ID]);
            var userPhone:UserPhone = req.body[ApiConstants.PHONE_NUMBER];

            userPhoneDelegate.update(userPhoneId, userPhone)
                .then(
                function handleUserPhoneUpdated(result) { res.json(result); },
                function handleUserPhoneUpdateFailed(err) { res.json(500).json(err); }
            )
        });

        /* Delete phone number */
        app.delete(ApiUrlDelegate.UserPhoneById(), function(req:express.Request, res:express.Response)
        {
            var userPhoneId:number = parseInt(req.params[ApiConstants.PHONE_NUMBER_ID]);

            userPhoneDelegate.delete(userPhoneId)
                .then(
                function handleUserPhoneDeleted(result) { res.json(result); },
                function handleUserPhoneDeleteFailed(err) { res.json(500).json(err); }
            )
        });
    }

}
export = UserPhoneApi