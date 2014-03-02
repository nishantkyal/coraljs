///<reference path='../_references.d.ts'/>
import q                                        = require('q');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import BaseDaoDelegate                          = require('../delegates/BaseDaoDelegate');
import TransactionLine                          = require('../models/TransactionLine');
import IDao                                     = require('../dao/IDao');
import TransactionLineDao                       = require('../dao/TransactionLineDao');
import ProductType                              = require('../enums/ProductType');

class TransactionLineDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new TransactionLineDao(); }

    create(object:any, tranaction?:any):q.Promise<any>
    {
        // TODO: Create transaction lines based on the product type of line being added
        var transactionLines = [object];

        switch(object[TransactionLine.PRODUCT_TYPE])
        {
            case ProductType.PHONE_CALL:
                break;
            case ProductType.PREPAID_DEPOSIT:
                break;
        }

        var self = this;
        var superCreate = super.create;
        return q.all(_.map(transactionLines, function(line) {
            return superCreate.call(self, line, tranaction);
        }));
    }
}
export = TransactionLineDelegate