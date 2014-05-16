///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import _                                            = require('underscore');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import BaseDaoDelegate                              = require('../delegates/BaseDaoDelegate');
import PhoneCallDelegate                            = require('../delegates/PhoneCallDelegate');
import TransactionLine                              = require('../models/TransactionLine');
import PhoneCall                                    = require('../models/PhoneCall');
import TransactionLineDao                           = require('../dao/TransactionLineDao');
import ItemType                                     = require('../enums/ItemType');
import TransactionType                              = require('../enums/TransactionType');
import Config                                       = require('../common/Config');

class TransactionLineDelegate extends BaseDaoDelegate
{
    constructor() { super(new TransactionLineDao()); }

    createPhoneCallTransactionLines(transactionId:number, call:PhoneCall, transaction?:Object):q.Promise<any>
    {
        var lines = this.getPhoneCallTransactionLines(call, transactionId);
        var self = this;

        return q.all(_.map(lines, function (line)
        {
            return self.create(line, transaction);
        }));
    }

    getPhoneCallTransactionLines(call:PhoneCall, transactionId?:number):TransactionLine[]
    {
        var callPrice = call.getPricePerMin() * call.getDuration();
        var networkCharges = call.getDuration() * Config.get(Config.CALL_NETWORK_CHARGES_PER_MIN_DOLLAR);
        var tax = (callPrice + networkCharges) * Config.get(Config.CALL_TAX_PERCENT)/100;

        var phoneCallTransactionLine = new TransactionLine();
        phoneCallTransactionLine.setAmount(callPrice);
        phoneCallTransactionLine.setAmountUnit(call.getPriceCurrency());
        phoneCallTransactionLine.setItemId(call.getId());
        phoneCallTransactionLine.setItemType(ItemType.PHONE_CALL);
        phoneCallTransactionLine.setTransactionType(TransactionType.PRODUCT);
        phoneCallTransactionLine.setTransactionId(transactionId);

        var networkChargesTransactionLine = new TransactionLine();
        networkChargesTransactionLine.setAmount(networkCharges);
        networkChargesTransactionLine.setAmountUnit(call.getPriceCurrency());
        networkChargesTransactionLine.setItemType(ItemType.NETWORK_CHARGES);
        networkChargesTransactionLine.setTransactionType(TransactionType.NETWORK_CHARGES);
        networkChargesTransactionLine.setTransactionId(transactionId);

        var taxationTransactionLine = new TransactionLine();
        taxationTransactionLine.setAmount(tax);
        taxationTransactionLine.setAmountUnit(call.getPriceCurrency());
        taxationTransactionLine.setItemType(ItemType.SERVICE_TAX);
        taxationTransactionLine.setTransactionType(TransactionType.TAX);
        taxationTransactionLine.setTransactionId(transactionId);

        return [phoneCallTransactionLine, networkChargesTransactionLine, taxationTransactionLine];
    }
}
export = TransactionLineDelegate