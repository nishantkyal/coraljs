import express                                              = require('express');
import ApiConstants                                         = require('../enums/ApiConstants');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import CouponDelegate                                       = require('../delegates/CouponDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import Coupon                                               = require('../models/Coupon');
import AccessControl                                        = require('../middleware/AccessControl');
import Utils                                                = require('../common/Utils');

class CouponApi
{
    couponDelegate = new CouponDelegate();

    constructor(app)
    {
        var self = this;

        app.get(ApiUrlDelegate.coupon(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var coupon = req.body[ApiConstants.COUPON];

            self.couponDelegate.search(coupon)
                .then(
                function couponSearched(coupons:Coupon[]) { res.send(JSON.stringify(coupons)); },
                function couponSearchFailed(error) { res.send(500); }
            );
        });

        app.get(ApiUrlDelegate.couponById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.ID]);

            self.couponDelegate.get(couponId)
                .then(
                function couponFetched(coupon:Coupon) { res.send(coupon.toJson()); },
                function couponFetchFailed() { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.coupon(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var coupon = req.body[ApiConstants.COUPON];

            self.couponDelegate.create(coupon)
                .then(
                function couponCreated(coupon:Coupon) { res.send(coupon.toJson()); },
                function couponCreateFailed() { res.send(500); }
            );
        });

        app.post(ApiUrlDelegate.couponById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.ID]);
            var coupon = req.body[ApiConstants.COUPON];

            self.couponDelegate.update({id: couponId}, coupon)
                .then(
                function couponUpdated(result) { res.send(200, result); },
                function couponUpdateFailed(error) { res.send(500, error); }
            );
        });

        app.delete(ApiUrlDelegate.couponById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.ID]);

            self.couponDelegate.delete(couponId)
                .then(
                    function couponDeleted() { res.send(200); },
                    function couponDeleteFailed() { res.send(500); }
                );
        });

        /* Used by front end to check duplicate coupon codes */
        app.get(ApiUrlDelegate.couponValidation(), AuthenticationDelegate.checkLogin(), function(req: express.Request, res: express.Response)
        {
            var coupon = req.body[ApiConstants.COUPON];

            // Send true if coupon not found or is invalid
            self.couponDelegate.find(coupon)
                .then(
                    function couponFound(c:Coupon)
                    {
                        if (Utils.isNullOrEmpty(c))
                            res.send(true);
                        else
                            res.send(409, 'Coupon code exists');
                    },
                    function couponFindFailed(error) { res.send(true); }
                )

        });
    }
}
export = CouponApi