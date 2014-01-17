import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');

/**
 * API calls for payments
 */
class PaymentApi
{
    constructor(app) {

        /** Search payment */
        app.get(ApiUrlDelegate.payment(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Get by id */
        app.get(ApiUrlDelegate.paymentById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Create new  */
        app.put(ApiUrlDelegate.payment(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Update */
        app.post(ApiUrlDelegate.paymentById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /** Delete */
        app.delete(ApiUrlDelegate.paymentById(), function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });
    }

}
export = PaymentApi