///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import _                                                    = require('underscore');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import MysqlDelegate                                        = require('./MysqlDelegate');
import TransactionLineDelegate                              = require('./TransactionLineDelegate');
import CouponDelegate                                       = require('./CouponDelegate');
import TransactionDAO                                       = require('../dao/TransactionDao');
import Transaction                                          = require('../models/Transaction');
import TransactionLine                                      = require('../models/TransactionLine');
import PhoneCall                                            = require('../models/PhoneCall');
import Coupon                                               = require('../models/Coupon');
import Utils                                                = require('../common/Utils');
import Config                                               = require('../common/Config');
import TransactionType                                      = require('../enums/TransactionType');
import CouponType                                           = require('../enums/CouponType');
import ItemType                                             = require('../enums/ItemType');
import MoneyUnit                                            = require('../enums/MoneyUnit');
import IncludeFlag                                          = require('../enums/IncludeFlag');
import TransactionStatus                                    = require('../enums/TransactionStatus');

class TransactionDelegate extends BaseDaoDelegate
{
    private couponDelegate = new CouponDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();

    constructor() { super(new TransactionDAO()); }

    createPhoneCallTransaction(object:any, phonecall:PhoneCall, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;
        var transaction;

        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(self, arguments)
                .then(
                function transactionLinesCreated(transactionId:number)
                {
                    return self.get(transactionId, null, [IncludeFlag.INCLUDE_TRANSACTION_LINE]);
                });

        return this.create(object, dbTransaction)
            .then(
            function transactionCreated(t)
            {
                transaction = t;
                return self.transactionLineDelegate.createPhoneCallTransactionLines(t.getId(), phonecall, dbTransaction);
            })
            .then(
            function transactionLinesCreated(...result)
            {
                return transaction.getId();
            });
    }

    createCancellationTransaction(callId:number, cancelledByUser:number, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        var transaction = new Transaction();
        transaction.setUserId(cancelledByUser);
        transaction.setStatus(TransactionStatus.COMPLETE);

        return q.all([
            self.create(transaction, dbTransaction),
            self.transactionLineDelegate.getTransactionLinesForItemId(callId)
        ])
            .then(
            function transactionCreated(...args)
            {
                var transaction:Transaction = args[0][0];
                var transactionLines:TransactionLine[] = args[0][1];

                var amount:number = _.reduce(_.pluck(transactionLines, TransactionLine.AMOUNT), function (memo:number, num:number) { return memo + num; }, 0) * 100;
                var cancellationAmount:number = amount * Config.get(Config.CALL_CANCELLATION_CHARGES_PERCENT) / 100;
                var cancellationAmountUnit:MoneyUnit = transactionLines[0].getAmountUnit();

                var cancellationLine = new TransactionLine();
                cancellationLine.setAmount(cancellationAmount);
                cancellationLine.setAmountUnit(cancellationAmountUnit);
                cancellationLine.setItemId(callId);
                cancellationLine.setItemType(ItemType.PHONE_CALL);
                cancellationLine.setTransactionType(TransactionType.CANCELLATION);
                cancellationLine.setTransactionId(transaction.getId());

                return [transaction, self.transactionLineDelegate.create(cancellationLine, dbTransaction)];
            })
            .spread(
            function transactionLineCreated(transaction, transactionLine)
            {
                return transaction;
            });
    }

    applyCoupon(transactionId:number, code:string, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;
        var args = arguments;

        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(self, args);

        // Check that discount has not already been applied to this transaction
        var discountLineSearch = {};
        discountLineSearch[TransactionLine.TRANSACTION_TYPE] = TransactionType.DISCOUNT;
        discountLineSearch[TransactionLine.TRANSACTION_ID] = transactionId;

        return self.transactionLineDelegate.find(discountLineSearch)
            .then(
            function discountLinesFetched(lines:TransactionLine[])
            {
                if (Utils.isNullOrEmpty(lines))
                    return q.all([
                        self.couponDelegate.findCoupon(code, Coupon.DASHBOARD_FIELDS),
                        self.transactionLineDelegate.search({transaction_id: transactionId})
                    ]);
                else
                    throw('Only one discount allowed at a time');
            })
            .then(
            function couponFetched(...result):any
            {
                var coupon = result[0][0];
                var transactionLines = result[0][1];

                if (Utils.isNullOrEmpty(coupon))
                    throw('Invalid or expired coupon');

                // TODO: Check if coupon applies to selected expert
                //var expertResourceId = coupon.getExpertId();

                var discountUnit = coupon.getDiscountUnit();
                var discountAmount = coupon.getDiscountAmount();
                var couponType = coupon.getCouponType();

                var discountableLines = _.filter(transactionLines, function (transactionLine:TransactionLine)
                {
                    if (discountUnit != MoneyUnit.PERCENT && transactionLine.getAmountUnit() != discountUnit)
                        return false;

                    switch (couponType)
                    {
                        case CouponType.EVERYTHING:
                            return true;

                        case CouponType.PHONE_CALL:
                            return transactionLine.getItemType() == ItemType.PHONE_CALL;
                        case CouponType.NETWORK_CHARGES:
                            return transactionLine.getItemType() == ItemType.NETWORK_CHARGES;
                        case CouponType.CALL_AND_NETWORK_CHARGES:
                            return transactionLine.getItemType() == ItemType.PHONE_CALL || transactionLine.getItemType() == ItemType.NETWORK_CHARGES;

                        case CouponType.PREPAID_DEPOSIT:
                            return transactionLine.getItemType() == ItemType.PREPAID_DEPOSIT;

                        case CouponType.VAT:
                            return transactionLine.getItemType() == ItemType.VAT;
                        case CouponType.SERVICE_TAX:
                            return transactionLine.getItemType() == ItemType.SERVICE_TAX;
                        case CouponType.ALL_TAXES:
                            return transactionLine.getItemType() == ItemType.SERVICE_TAX || transactionLine.getItemType() == ItemType.VAT;
                    }
                });

                var discountableAmounts = _.pluck(discountableLines, TransactionLine.AMOUNT);
                var discountableTotalAmount = _.reduce(discountableAmounts, function (sum:number, n:number) { return sum += n; })
                var discount:number = (discountUnit == MoneyUnit.PERCENT) ? discountableTotalAmount * discountAmount / 100 : discountAmount;
                discount = Math.min(discountableTotalAmount, discount);

                var discountLine = new TransactionLine();
                discountLine.setTransactionId(transactionId);
                discountLine.setTransactionType(TransactionType.DISCOUNT);
                discountLine.setItemId(coupon.getId());
                discountLine.setItemType(ItemType.SERVICE_TAX);
                discountLine.setAmount(-discount);
                discountLine.setAmountUnit(discountUnit);

                // Create discount transaction line and increment coupons used counter
                return q.all([
                    //TODO[ankit] change mark used function
                    //self.couponDelegate.markUsed(code, dbTransaction),
                    self.transactionLineDelegate.create(discountLine, dbTransaction)
                ]);
            },
            function couponFetchFailed(error)
            {
                self.logger.error('Error while applying coupon: %s. Error: %s', code, JSON.stringify(error));
                throw(error);
            });
    }

    removeCoupon(transactionId:number, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;

        var criteria = {};
        criteria[TransactionLine.TRANSACTION_ID] = transactionId;
        criteria[TransactionLine.TRANSACTION_TYPE] = TransactionType.DISCOUNT;

        return self.transactionLineDelegate.delete(criteria, dbTransaction);
    }

    /* Mark transaction as expired if user operation times out */
    markExpired(transactionId:number, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(dbTransaction))
            return MysqlDelegate.executeInTransaction(self, arguments)

        // 1. Update transaction status to expired
        // 2. Remove all coupons from transaction and free them

        var couponLinesSearch = {};
        couponLinesSearch[TransactionLine.TRANSACTION_ID] = transactionId;
        couponLinesSearch[TransactionLine.TRANSACTION_TYPE] = TransactionType.DISCOUNT;

        return q.all([
            self.update(transactionId, Utils.createSimpleObject(Transaction.STATUS, TransactionStatus.EXPIRED), dbTransaction),
            self.transactionLineDelegate.find(couponLinesSearch, [TransactionLine.ID, TransactionLine.ITEM_ID])
        ])
            .then(
            function couponsFetched(lines:TransactionLine[])
            {
                return q.all([
                    self.couponDelegate.markRemoved(_.pluck(lines, TransactionLine.ITEM_ID), dbTransaction),
                    self.transactionLineDelegate.delete({id: _.pluck(lines, TransactionLine.ID)}, dbTransaction)
                ]);
            });
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var self = this;
        result = [].concat(result);

        switch (include)
        {
            case IncludeFlag.INCLUDE_TRANSACTION_LINE:
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, _.pluck(result, Transaction.ID)));
        }
        return super.getIncludeHandler(include, result);
    }
}
export = TransactionDelegate