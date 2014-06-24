import log4js                                               = require('log4js');
import express                                              = require('express');
import q                                                    = require('q');
import _                                                    = require('underscore');
import url                                                  = require('url');
import crypto                                               = require('crypto');
import Transaction                                          = require('../models/Transaction');
import User                                                 = require('../models/User');
import TransactionLine                                      = require('../models/TransactionLine');
import Payment                                              = require('../models/Payment');
import Config                                               = require('../common/Config');
import Credentials                                          = require('../common/Credentials');
import Utils                                                = require('../common/Utils');
import PaymentUrls                                          = require('../routes/payment/Urls');
import TransactionDelegate                                  = require('../delegates/TransactionDelegate');
import PaymentDelegate                                      = require('../delegates/PaymentDelegate');
import TransactionStatus                                    = require('../enums/TransactionStatus');
import PaymentGateway                                       = require('../enums/PaymentGateway');
import ApiConstants                                         = require('../enums/ApiConstants');

class PayZippyProvider
{
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    private transactionDelegate = new TransactionDelegate();
    private paymentDelegate = new PaymentDelegate();

    private static MERCHANT_TRANSACTION_ID:string = 'merchant_transaction_id';
    private static PAYZIPPY_TRANSACTION_ID:string = 'payzippy_transaction_id';
    private static TRANSACTION_STATUS:string = 'transaction_status';
    private static TRANSACTION_AMOUNT:string = 'transaction_amount';
    private static TRANSACTION_CURRENCY:string = 'transaction_currency';
    private static TRANSACTION_RESPONSE_CODE:string = 'transaction_response_code';
    private static TRANSACTION_RESPONSE_MESSAGE:string = 'transaction_response_message';
    private static FRAUD_ACTION:string = 'fraud_action';
    private static FRAUD_DETAILS:string = 'fraud_details';

    private static FRAUD_ACTION_ACCEPT:string = 'Accept';
    private static FRAUD_ACTION_REJECT:string = 'Reject';
    private static FRAUD_ACTION_REVIEW:string = 'Review';
    private static FRAUD_ACTION_NO_ACTION:string = 'No Action';

    private static TRANSACTION_STATUS_SUCCESS:string = 'SUCCESS';
    private static TRANSACTION_STATUS_FAILED:string = 'FAILED';
    private static TRANSACTION_STATUS_PENDING:string = 'PENDING';


    getPaymentUrl(transaction:Transaction, amount:number, user:User):string
    {
        var data = {
            buyer_email_address: user.getEmail(),
            buyer_unique_id: user.getId(),
            callback_url: url.resolve(Config.get(Config.DASHBOARD_URI), PaymentUrls.paymentCallback()),
            currency: "INR",
            hash_method: 'MD5',
            is_user_logged_in: true,
            merchant_id: Credentials.get(Credentials.PAY_ZIPPY_MERCHANT_ID),
            merchant_key_id: Credentials.get(Credentials.PAY_ZIPPY_MERCHANT_KEY_ID),
            merchant_transaction_id: transaction.getId() + '-' + Utils.getRandomInt(999, 9999),
            payment_method: null,
            transaction_amount: amount,
            transaction_type: 'sale',
            ui_mode: 'redirect'
        };

        var concatString = _.values(data).concat(Credentials.get(Credentials.PAY_ZIPPY_SECRET_KEY)).join('|');
        var md5sum = crypto.createHash('md5');
        var hash:string = md5sum.update(concatString).digest('hex');

        data['hash'] = hash;

        var payZippyUrl:string = Credentials.get(Credentials.PAY_ZIPPY_CHARGING_URI);
        payZippyUrl = Utils.addQueryToUrl(payZippyUrl, data);

        return payZippyUrl;
    }

    handleResponse(req:express.Request):q.Promise<any>
    {
        var self = this;
        var response = req.body.hasOwnProperty('hash') ? req.body : req.query;
        var hash = response['hash'];
        var transactionStatus:TransactionStatus = TransactionStatus.PAYMENT_SUCCESS;
        delete response['hash'];

        var sortedKeys:string[] = _.keys(response).sort();
        var sortedValues:string[] = _.map(sortedKeys, function (key) { return response[key]});

        var concatString = _.values(sortedValues).concat(Credentials.get(Credentials.PAY_ZIPPY_SECRET_KEY)).join('|');
        var md5sum = crypto.createHash('md5');
        var computedHash:string = md5sum.update(concatString).digest('hex');

        if (computedHash != hash)
            return q.reject("HASH_MISMATCH");

        if (response[PayZippyProvider.TRANSACTION_STATUS] != PayZippyProvider.TRANSACTION_STATUS_SUCCESS)
            transactionStatus = TransactionStatus.PAYMENT_FAILED;

        // Mark the transaction id as success and send it back
        var transactionId = parseInt(response[PayZippyProvider.MERCHANT_TRANSACTION_ID].split('-')[0]);
        var paymentTransactionId = response[PayZippyProvider.PAYZIPPY_TRANSACTION_ID];

        var payment = new Payment();
        payment.setAmount(response[PayZippyProvider.TRANSACTION_AMOUNT]);
        payment.setGatewayId(PaymentGateway.PAYZIPPY);
        payment.setGatewayResponseCode(response[PayZippyProvider.TRANSACTION_RESPONSE_CODE]);
        payment.setGatewayTransactionId(paymentTransactionId);

        return self.paymentDelegate.create(payment)
            .then(
            function paymentCreated(createdPayment:Payment)
            {
                return self.transactionDelegate.update(transactionId, {payment_id: createdPayment.getId(), status: transactionStatus});
            })
            .then(
            function statusUpdated()
            {
                if (transactionStatus == TransactionStatus.PAYMENT_SUCCESS)
                    return transactionId;
                throw(response[PayZippyProvider.TRANSACTION_RESPONSE_MESSAGE]);
            });
    }
}
export = PayZippyProvider