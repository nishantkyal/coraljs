///<reference path='../_references.d.ts'/>
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
            app.get(delegates.ApiUrlDelegate.payment(), function (req, res)
            {

            });

            /** Get by id */
            app.get(delegates.ApiUrlDelegate.paymentById(), function (req, res)
            {

            });

            /** Create new  */
            app.put(delegates.ApiUrlDelegate.payment(), function (req, res)
            {

            });

            /** Update */
            app.post(delegates.ApiUrlDelegate.paymentById(), function (req, res)
            {

            });

            /** Delete */
            app.delete(delegates.ApiUrlDelegate.paymentById(), function (req, res)
            {

            });
        }
    }
}