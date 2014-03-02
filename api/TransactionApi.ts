import express                                  = require('express');
import ApiUrlDelegate                           = require('../delegates/ApiUrlDelegate');
import TransactionDelegate                      = require('../delegates/TransactionDelegate');
import ApiConstants                             = require('../enums/ApiConstants');
import Transaction                              = require('../models/Transaction');

/*
 * API calls for managing payment transactions
 * Allow only through searchntalk.com
 */
class TransactionApi
{
    constructor(app)
    {
        var transactionDelegate = new TransactionDelegate();

        app.put(ApiUrlDelegate.transaction(), function(req:express.Request, res:express.Response)
        {
            var transaction = req.body[ApiConstants.TRANSACTION];

            if (transaction.isValid())
            {
                transactionDelegate.create(transaction)
                    .then(
                        function transactionCreated(transaction:Transaction) { res.json(transaction.toJson()); },
                        function transactionCreateError(error) { res.send(500, error); }
                    )
            }
        });

        app.post(ApiUrlDelegate.transactionById(), function(req:express.Request, res:express.Response)
        {

        });

        app.put(ApiUrlDelegate.transactionItem(), function(req:express.Request, res:express.Response)
        {

        });

        app.post(ApiUrlDelegate.transactionItemById(), function(req:express.Request, res:express.Response)
        {

        });

        app.delete(ApiUrlDelegate.transactionItemById(), function(req:express.Request, res:express.Response)
        {

        });

        app.get(ApiUrlDelegate.transactionById(), function(req:express.Request, res:express.Response)
        {

        });

    }

}

export = TransactionApi