///<reference path='../_references.d.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/TransactionDao.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>

module delegates
{
    export class TransactionDelegate extends BaseDaoDelegate
    {
        search(user_id:string, filters?:Object, fields?:string[]):Q.Promise<any>
        {
            filters['user_id'] = user_id;
            return super.search(filters, {'fields': fields});
        }

        getAccountBalance(user_id:string):Q.Promise<any>
        {
            return super.search({user_id: user_id}, ['total'])
                .then(
                function transactionsFetched(transactions)
                {
                    var sumTotal = _.reduce(_.pluck(transactions, 'total'), function(memo, num) { return memo + num; }, 0);
                    return sumTotal;
                });
        }

        getDao():dao.IDao { return new dao.TransactionDao(); }

    }
}