///<reference path='../_references.d.ts'/>
///<reference path='../delegates/ApiUrlDelegate.ts'/>

/**
 * API calls for managing payment details
 * Bank/paypal details for users to which they can withdraw money
 */
module api
{
    export class PayoutDetailApi
    {
        constructor(app)
        {
            /** Search payout-detail */
            app.get(delegates.ApiUrlDelegate.payoutDetail(), function (req, res)
            {

            });

            /** Get by id */
            app.get(delegates.ApiUrlDelegate.payoutDetailById(), function (req, res)
            {

            });

            /** Create new  */
            app.put(delegates.ApiUrlDelegate.payoutDetail(), function (req, res)
            {

            });

            /** Update */
            app.post(delegates.ApiUrlDelegate.payoutDetailById(), function (req, res)
            {

            });

            /** Delete */
            app.delete(delegates.ApiUrlDelegate.payoutDetailById(), function (req, res)
            {

            });
        }

    }
}