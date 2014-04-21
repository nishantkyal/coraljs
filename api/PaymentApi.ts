///<reference path='../_references.d.ts'/>
import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');

/*
 * API calls for payments
 */
class PaymentApi
{
    constructor(app, secureApp) {

        /* Search payment */
        app.get(ApiUrlDelegate.payment(), function(req:express.Request, res:express.Response)
        {

        });

        /* Get by id */
        app.get(ApiUrlDelegate.paymentById(), function(req:express.Request, res:express.Response)
        {

        });

        /* Create new  */
        app.put(ApiUrlDelegate.payment(), function(req:express.Request, res:express.Response)
        {

        });

        /* Update */
        app.post(ApiUrlDelegate.paymentById(), function(req:express.Request, res:express.Response)
        {

        });

        /* Delete */
        app.delete(ApiUrlDelegate.paymentById(), function(req:express.Request, res:express.Response)
        {

        });
    }

}
export = PaymentApi