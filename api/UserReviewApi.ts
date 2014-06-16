import express                                              = require('express');
import connect_ensure_login                                 = require('connect-ensure-login');
import AccessControl                                        = require('../middleware/AccessControl');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import UserReviewDelegate                                = require('../delegates/UserReviewDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import UserReview                                        = require('../models/UserReview');

class UserReviewApi
{
    userReviewDelegate;
    constructor(app, secureApp)
    {
        var self = this;
        this.userReviewDelegate = new UserReviewDelegate();

        app.post(ApiUrlDelegate.reviewById(), connect_ensure_login.ensureLoggedIn(), function(req:express.Request, res:express.Response)
        {
            var review:any = req.body[ApiConstants.USER_REVIEW];
            var reviewId = parseInt(req.params[ApiConstants.REVIEW_ID]);
            self.userReviewDelegate.update({id: reviewId}, review)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.review(), connect_ensure_login.ensureLoggedIn(), function(req:express.Request, res:express.Response)
        {
            var review:UserReview = req.body[ApiConstants.USER_REVIEW];

            self.userReviewDelegate.createUserReview(review)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.reviewById(), connect_ensure_login.ensureLoggedIn(), function(req:express.Request, res:express.Response)
        {
            var reviewId = parseInt(req.params[ApiConstants.REVIEW_ID]);
            var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);

            self.userReviewDelegate.delete({id:reviewId}) // if hard deleting then add profileId:profileId
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = UserReviewApi