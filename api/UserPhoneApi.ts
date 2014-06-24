import express                                              = require('express');
import ApiConstants                                         = require('../enums/ApiConstants');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserPhoneDelegate                                    = require('../delegates/UserPhoneDelegate');
import UserPhone                                            = require('../models/UserPhone');

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
        app.put(ApiUrlDelegate.userPhone(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            // TODO: Restrict creating a verified phone number
            var userPhone:UserPhone = req.body[ApiConstants.PHONE_NUMBER];

            if (userPhone.isValid())
                userPhoneDelegate.create(userPhone)
                    .then(
                    function handleUserPhoneCreated(result) { res.json(result); },
                    function handleUserPhoneCreateFailed(err) { res.json(500).json(err); }
                )
            else
                res.status(500).json('Invalid input');
        });

        /* Search phone number */
        app.get(ApiUrlDelegate.userPhone(), function(req:express.Request, res:express.Response)
        {
            userPhoneDelegate.search(req.body[ApiConstants.PHONE_NUMBER])
                .then(
                function handleUserPhoneSearched(result) { res.json(result); },
                function handleUserPhoneSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Get phone number by id */
        app.get(ApiUrlDelegate.userPhoneById(), function(req:express.Request, res:express.Response)
        {
            var userPhoneId = parseInt(req.params[ApiConstants.PHONE_NUMBER_ID]);

            userPhoneDelegate.get(userPhoneId)
                .then(
                function handleUserPhoneSearched(result) { res.json(result); },
                function handleUserPhoneSearchFailed(err) { res.json(500).json(err); }
            )
        });

        /* Update phone number */
        app.post(ApiUrlDelegate.userPhoneById(), function(req:express.Request, res:express.Response)
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
        app.delete(ApiUrlDelegate.userPhoneById(), function(req:express.Request, res:express.Response)
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