import express                                              = require('express');
import AccessControl                                        = require('../middleware/AccessControl');
import AuthenticationDelegate                               = require('../delegates/AuthenticationDelegate');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import PricingSchemeDelegate                                = require('../delegates/PricingSchemeDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import PricingScheme                                        = require('../models/PricingScheme');

class PricingSchemeApi
{
    private pricingSchemeDelegate = new PricingSchemeDelegate();

    constructor(app, secureApp)
    {
        var self = this;

        app.get(ApiUrlDelegate.pricingSchemeById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var pricingSchemeId:number = parseInt(req.body[ApiConstants.PRICING_SCHEME]);

            self.pricingSchemeDelegate.create(pricingSchemeId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.post(ApiUrlDelegate.pricingSchemeById(), function(req:express.Request, res:express.Response)
        {
            var pricingScheme:any = req.body[ApiConstants.PRICING_SCHEME];
            var pricingSchemeId = parseInt(req.params[ApiConstants.PRICING_SCHEME_ID]);

            self.pricingSchemeDelegate.update({id: pricingSchemeId}, pricingScheme)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.pricingScheme(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var pricingScheme:PricingScheme = req.body[ApiConstants.PRICING_SCHEME];

            self.pricingSchemeDelegate.create(pricingScheme)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });

        app.delete(ApiUrlDelegate.pricingSchemeById(), AuthenticationDelegate.checkLogin(), function(req:express.Request, res:express.Response)
        {
            var pricingSchemeId = parseInt(req.params[ApiConstants.PRICING_SCHEME_ID]);

            self.pricingSchemeDelegate.delete(pricingSchemeId)
                .then(
                function userUpdated() { res.send(200); },
                function userUpdateError(error) { res.send(500); }
            );
        });
    }
}
export = PricingSchemeApi