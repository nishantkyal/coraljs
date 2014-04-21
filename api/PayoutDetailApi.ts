import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');

/*
 * API calls for managing payment details
 * Bank/paypal details for users to which they can withdraw money
 */
class PayoutDetailApi
{
    constructor(app, secureApp)
    {
        /* Search payout-detail */
        app.get(ApiUrlDelegate.payoutDetail(), function(req:express.Request, res:express.Response)
        {

        });

        /* Get by id */
        app.get(ApiUrlDelegate.payoutDetailById(), function(req:express.Request, res:express.Response)
        {

        });

        /* Create new  */
        app.put(ApiUrlDelegate.payoutDetail(), function(req:express.Request, res:express.Response)
        {

        });

        /* Update */
        app.post(ApiUrlDelegate.payoutDetailById(), function(req:express.Request, res:express.Response)
        {

        });

        /* Delete */
        app.delete(ApiUrlDelegate.payoutDetailById(), function(req:express.Request, res:express.Response)
        {

        });
    }

}
export = PayoutDetailApi