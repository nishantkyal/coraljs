import express              = require('express');
///<reference path='../delegates/ApiUrlDelegate.ts'/>

/**
 * API calls for payments
 */
module api
{
    export class PaymentApi
    {
        constructor(app)
        {

            /** Search payment */
            app.get(delegates.ApiUrlDelegate.payment(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });

            /** Get by id */
            app.get(delegates.ApiUrlDelegate.paymentById(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });

            /** Create new  */
            app.put(delegates.ApiUrlDelegate.payment(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });

            /** Update */
            app.post(delegates.ApiUrlDelegate.paymentById(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });

            /** Delete */
            app.delete(delegates.ApiUrlDelegate.paymentById(), function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
            {

            });
        }
    }
}