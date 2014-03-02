///<reference path='../_references.d.ts'/>
import q                            = require('q');
import _                            = require('underscore');
import BaseDAODelegate              = require('./BaseDaoDelegate');
import MysqlDelegate                = require('./MysqlDelegate');
import TransactionLineDelegate      = require('./TransactionLineDelegate');
import IDao                         = require('../dao/IDao');
import TransactionDAO               = require('../dao/TransactionDao');
import Transaction                  = require('../models/Transaction');
import TransactionLine              = require('../models/TransactionLine');

class TransactionDelegate extends BaseDAODelegate
{
    create(object:any, transaction?:any):q.Promise<any>
    {
        var self = this;

        return MysqlDelegate.beginTransaction()
            .then(
            function transactionStarted(t)
            {
                transaction = t;
                self.create(object, t);
            })
            .then(
            function transactionCreated(t):any
            {
                if (object[Transaction.TRANSACTION_LINES])
                {
                    var transactionLineDelegate = new TransactionLineDelegate();
                    return q.all(_.map(object[Transaction.TRANSACTION_LINES], function (tl:TransactionLine)
                        {
                            if (tl.isValid())
                                return transactionLineDelegate.create(tl, transaction);
                            return null;
                        }))
                        .then(
                        function transactionLinesCreated(...args)
                        {
                            t.set(Transaction.TRANSACTION_LINES, args);
                            return t;
                        }
                    );
                }
                else
                    return t;
            });
    }

    getDao():IDao { return new TransactionDAO(); }

}
export = TransactionDelegate
