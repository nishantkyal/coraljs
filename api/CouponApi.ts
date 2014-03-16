///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import ApiConstants                                         = require('../enums/ApiConstants');
import CouponDelegate                                       = require('../delegates/CouponDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import Coupon                                               = require('../models/Coupon');
import AccessControl                                        = require('../middleware/AccessControl');

class CouponApi
{
    couponDelegate = new CouponDelegate();

    constructor(app)
    {
        app.get(ApiUrlDelegate.coupon(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var coupon = req.body[ApiConstants.COUPON];

            this.couponDelegate.search(coupon)
                .then(
                function couponSearched(coupons:Coupon[]) { res.send(JSON.stringify(coupons)); },
                function couponSearchFailed() { res.send(500); }
            );
        });

        app.get(ApiUrlDelegate.couponById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.COUPON_ID]);

            this.couponDelegate.get(couponId)
                .then(
                function couponFetched(coupon:Coupon) { res.send(coupon.toJson()); },
                function couponFetchFailed() { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.coupon(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var coupon = req.body[ApiConstants.COUPON];

            this.couponDelegate.create(coupon)
                .then(
                function couponCreated(coupon:Coupon) { res.send(coupon.toJson()); },
                function couponCreateFailed() { res.send(500); }
            );
        });

        app.post(ApiUrlDelegate.couponById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.COUPON_ID]);
            var coupon = req.body[ApiConstants.COUPON];

            this.couponDelegate.update(couponId, coupon)
                .then(
                function couponUpdated() { res.send(200); },
                function couponUpdateFailed() { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.couponById(), AccessControl.allowDashboard, function(req:express.Request, res:express.Response)
        {
            var couponId:number = parseInt(req.params[ApiConstants.COUPON_ID]);

            this.couponDelegate.delete(couponId)
                .then(
                    function couponDeleted() { res.send(200); },
                    function couponDeleteFailed() { res.send(500); }
                );
        });
    }
}
export = CouponApi