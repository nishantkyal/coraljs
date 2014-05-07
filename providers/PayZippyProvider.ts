import _                                                    = require('underscore');
import url                                                  = require('url');
import crypto                                               = require('crypto');
import Transaction                                          = require('../models/Transaction');
import User                                                 = require('../models/User');
import TransactionLine                                      = require('../models/TransactionLine');
import Config                                               = require('../common/Config');
import Utils                                                = require('../common/Utils');
import DashboardUrls                                        = require('../routes/dashboard/Urls');

class PayZippyProvider
{
    getPaymentUrl(transaction:Transaction, lines:TransactionLine[], user:User):string
    {
        var data = {
            buyer_email_address: user.getEmail(),
            buyer_unique_id: user.getId(),
            callback_url: url.resolve(Config.get(Config.DASHBOARD_URI), DashboardUrls.paymentCallback()),
            currency: "INR",
            hash_method: 'MD5',
            is_user_logged_in: true,
            merchant_id: Config.get(Config.PAY_ZIPPY_MERCHANT_ID),
            merchant_key_id: Config.get(Config.PAY_ZIPPY_MERCHANT_KEY_ID),
            merchant_transaction_id: transaction.getId(),
            payment_method: null,
            transaction_amount: _.reduce(_.pluck(lines, TransactionLine.AMOUNT), function(memo:number, num:number){ return memo + num; }, 0) * 100,
            transaction_type: 'sale',
            ui_mode: 'redirect'
        };

        var concatString = _.values(data).concat(Config.get(Config.PAY_ZIPPY_SECRET_KEY)).join('|');
        var md5sum = crypto.createHash('md5');
        var hash:string = md5sum.update(concatString).digest('hex');

        data['hash'] = hash;

        var payZippyUrl:string = Config.get(Config.PAY_ZIPPY_CHARGING_URI);
        payZippyUrl = Utils.addQueryToUrl(payZippyUrl, data);

        return payZippyUrl;
    }

    getTransactionId(response:Object):number
    {
        var hash = response['hash'];
        delete response['hash'];

        var sortedKeys:string[] = _.keys(response).sort();
        var sortedValues:string[] = _.map(sortedKeys, function (key) { return response[key]});

        var concatString = _.values(sortedValues).concat(Config.get(Config.PAY_ZIPPY_SECRET_KEY)).join('|');
        var md5sum = crypto.createHash('md5');
        var computedHash:string = md5sum.update(concatString).digest('hex');

        return (computedHash == hash) ? response['merchant_transaction_id'] : null;
    }
}
export = PayZippyProvider