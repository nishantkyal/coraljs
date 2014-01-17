import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');

/**
 * API calls for managing payment details
 * Bank/paypal details for users to which they can withdraw money
 */
class PayoutDetailApi
{
    constructor(app)
    {
        /** Search payout-detail */
        app.get(ApiUrlDelegate.payoutDetail(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Get by id */
        app.get(ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Create new  */
        app.put(ApiUrlDelegate.payoutDetail(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Update */
        app.post(ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Delete */
        app.delete(ApiUrlDelegate.payoutDetailById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });
    }

}
export = PayoutDetailApi