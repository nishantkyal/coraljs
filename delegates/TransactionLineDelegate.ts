///<reference path='../_references.d.ts'/>
import q                                        = require('q');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import BaseDaoDelegate                          = require('../delegates/BaseDaoDelegate');
import PhoneCallDelegate                        = require('../delegates/PhoneCallDelegate');
import TransactionLine                          = require('../models/TransactionLine');
import PhoneCall                                = require('../models/PhoneCall');
import TransactionLineDao                       = require('../dao/TransactionLineDao');
import ItemType                                 = require('../enums/ItemType');
import TransactionType                          = require('../enums/TransactionType');

class TransactionLineDelegate extends BaseDaoDelegate
{
    constructor() { super(new TransactionLineDao()); }

    createPhoneCallTransactionLines(transactionId:number, call:PhoneCall, transaction?:any):q.Promise<any>
    {
        var self = this;

        var phoneCallTransactionLine = new TransactionLine();
        phoneCallTransactionLine.setAmount(call.getPrice());
        phoneCallTransactionLine.setAmountUnit(call.getPriceCurrency());
        phoneCallTransactionLine.setItemId(call.getId());
        phoneCallTransactionLine.setItemType(ItemType.PHONE_CALL);
        phoneCallTransactionLine.setTransactionType(TransactionType.PRODUCT);
        phoneCallTransactionLine.setTransactionId(transactionId);

        var networkChargesTransactionLine = new TransactionLine();
        networkChargesTransactionLine.setAmount(call.getPrice());
        networkChargesTransactionLine.setAmountUnit(call.getPriceCurrency());
        networkChargesTransactionLine.setItemType(ItemType.NETWORK_CHARGES);
        networkChargesTransactionLine.setTransactionType(TransactionType.NETWORK_CHARGES);
        networkChargesTransactionLine.setTransactionId(transactionId);

        var taxationTransactionLine = new TransactionLine();
        taxationTransactionLine.setAmount(call.getPrice());
        taxationTransactionLine.setAmountUnit(call.getPriceCurrency());
        taxationTransactionLine.setItemType(ItemType.SERVICE_TAX);
        taxationTransactionLine.setTransactionType(TransactionType.TAX);
        taxationTransactionLine.setTransactionId(transactionId);

        return q.all([
            self.create(phoneCallTransactionLine, transaction),
            self.create(networkChargesTransactionLine, transaction),
            self.create(taxationTransactionLine, transaction)
        ]);
    }
}
export = TransactionLineDelegate