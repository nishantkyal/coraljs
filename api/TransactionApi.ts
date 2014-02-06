import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');

/**
 * API calls for managing payment transactions
 * Allow only through searchntalk.com
 */
class TransactionApi
{
    constructor(app)
    {
        /** Create a new transaction **/
        app.put(ApiUrlDelegate.transaction(), function(req:express.Request, res:express.Response)
        {
            // Validate item to be added
        });

        /** Update transaction **/
        app.post(ApiUrlDelegate.transactionById(), function(req:express.Request, res:express.Response)
        {

        });

        /** Add item **/
        app.put(ApiUrlDelegate.transactionItem(), function(req:express.Request, res:express.Response)
        {

        });

        /**
         * Update item
         * Remove all rows for item and insert again
         **/
        app.post(ApiUrlDelegate.transactionItemById(), function(req:express.Request, res:express.Response)
        {

        });

        /**
         * Remove item
         */
        app.delete(ApiUrlDelegate.transactionItemById(), function(req:express.Request, res:express.Response)
        {

        });

        /**
         * Get transaction
         * Fields : [summary, items, discounts, invoice]
         **/
        app.get(ApiUrlDelegate.transactionById(), function(req:express.Request, res:express.Response)
        {

        });

    }

}

export = TransactionApi