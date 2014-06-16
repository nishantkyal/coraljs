///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import _                                            = require('underscore');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import BaseDaoDelegate                              = require('../delegates/BaseDaoDelegate');
import PhoneCallDelegate                            = require('../delegates/PhoneCallDelegate');
import TransactionLine                              = require('../models/TransactionLine');
import PhoneCall                                    = require('../models/PhoneCall');
import ItemType                                     = require('../enums/ItemType');
import TransactionType                              = require('../enums/TransactionType');
import Config                                       = require('../common/Config');
import Utils                                        = require('../common/Utils');

class TransactionLineDelegate extends BaseDaoDelegate
{
    constructor() { super(TransactionLine); }

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
        var tax = (callPrice + networkCharges) * Config.get(Config.CALL_TAX_PERCENT) / 100;

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

    /**
     * Get all transaction lines for a transaction identified by item id
     * e.g. Get all transaction lines for a call id
     */
    getTransactionLinesForItemId(itemId:number):q.Promise<TransactionLine[]>
    {
        var self = this;

        return self.find(Utils.createSimpleObject(TransactionLine.ITEM_ID, itemId))
            .then(
            function transactionIdFound(line:TransactionLine)
            {
                return self.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, line.getTransactionId()));
            });
    }
}
export = TransactionLineDelegate