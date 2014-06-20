import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserReviewDelegate                                   = require('../delegates/UserReviewDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserReview                                           = require('../models/UserReview');

class UserReviewApi
{
    userReviewDelegate;
    constructor(app, secureApp)
    {
        var self = this;
        this.userReviewDelegate = new UserReviewDelegate();

        app.post(ApiUrlDelegate.reviewById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var review:any = req.body[ApiConstants.USER_REVIEW];
            var reviewId = parseInt(req.params[ApiConstants.REVIEW_ID]);
            self.userReviewDelegate.update({id: reviewId}, review)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.review(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var review:UserReview = req.body[ApiConstants.USER_REVIEW];

            self.userReviewDelegate.createUserReview(review)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.reviewById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var reviewId = parseInt(req.params[ApiConstants.REVIEW_ID]);

            self.userReviewDelegate.delete(reviewId) // if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = UserReviewApi