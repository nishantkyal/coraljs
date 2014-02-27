import q                            = require('q');
import _                            = require('underscore');
import BaseDAODelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import TransactionDAO               = require('../dao/TransactionDao');

class TransactionDelegate extends BaseDAODelegate
{
    search(user_id:string, filters?:Object, fields?:string[]):q.Promise<any>
    {
        filters['user_id'] = user_id;
        return super.search(filters, {'fields': fields});
    }

    getAccountBalance(user_id:string):q.Promise<any>
    {
        return super.search({user_id: user_id}, ['total'])
            .then(
            function transactionsFetched(transactions)
            {
                var sumTotal = _.reduce(_.pluck(transactions, 'total'), function(memo:Number, num:Number) { return memo + num; }, 0);
                return sumTotal;
            });
    }

    getDao():IDao { return new TransactionDAO(); }

}
export = TransactionDelegate
