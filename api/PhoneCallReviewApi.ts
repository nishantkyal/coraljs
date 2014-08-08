import _                                                    = require('underscore');
import express                                              = require('express');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import PhoneCallReviewDelegate                              = require('../delegates/PhoneCallReviewDelegate');
import PhoneCallReview                                      = require('../models/PhoneCallReview');
import ApiConstants                                         = require('../enums/ApiConstants');
import Utils                                                = require('../common/Utils');

class PhoneCallReviewApi
{
    constructor(app)
    {
        var self = this;
        var phoneCallReviewDelegate = new PhoneCallReviewDelegate();

        app.put(ApiUrlDelegate.phoneCallReview(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var phoneCallReview:PhoneCallReview = req.body[ApiConstants.PHONE_CALL_REVIEW];

            phoneCallReviewDelegate.create(phoneCallReview)
                .then(
                    function reviewCreated(review:PhoneCallReview){ res.json(review) },
                    function reviewCreateError(error) { res.status(500).send(error); }
                )
        });

        app.post(ApiUrlDelegate.phoneCallReviewById(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var phoneCallReview:PhoneCallReview = req.body[ApiConstants.PHONE_CALL_REVIEW];
            var reviewId = parseInt(req.params[ApiConstants.REVIEW_ID]);

            phoneCallReviewDelegate.update(Utils.createSimpleObject(PhoneCallReview.COL_ID,reviewId),phoneCallReview)
                .then(
                    function reviewCreated(){ res.send(200) },
                    function reviewCreateError(error) { res.status(500).send(error); }
                )
        });

        app.delete(ApiUrlDelegate.phoneCallReviewById(), AuthenticationDelegate.checkLogin(), function (req:express.Request, res:express.Response)
        {
            var reviewId = parseInt(req.params[ApiConstants.PHONE_CALL_REVIEW_ID]);

            phoneCallReviewDelegate.delete(Utils.createSimpleObject(PhoneCallReview.COL_ID,reviewId))
                .then(
                    function reviewCreated(){ res.send(200) },
                    function reviewCreateError(error) { res.status(500).send(error); }
                )
        });

    }
}
export = PhoneCallReviewApi