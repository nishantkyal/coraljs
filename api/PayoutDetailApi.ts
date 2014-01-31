import express              = require('express');
///<reference path='../delegates/ApiUrlDelegate'/>;

/**
 * API calls for managing payment details
 * Bank/paypal details for users to which they can withdraw money
 */
class PayoutDetailApi
{
    constructor(app)
    {
        /** Search payout-detail */
        app.get(delegates.ApiUrlDelegate.payoutDetail(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Get by id */
        app.get(delegates.ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Create new  */
        app.put(delegates.ApiUrlDelegate.payoutDetail(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Update */
        app.post(delegates.ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Delete */
        app.delete(delegates.ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });
    }

}
export = PayoutDetailApi