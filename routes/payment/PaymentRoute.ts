import Urls                                         = require('./Urls');

class PaymentRoute
{
    constructor(app, secureApp)
    {
        app.get(Urls.payment(), Middleware.requireCallerAndCallDetails, Middleware.ensureNotCallingSelf, this.callPaymentPage.bind(this));

        app.post(Urls.payment(), Middleware.requireCallerAndCallDetails, Middleware.ensureNotCallingSelf, this.callPayment.bind(this));
        app.post(Urls.coupon(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.applyCoupon.bind(this));
        app.post(Urls.checkout(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.checkout.bind(this));
        app.get(Urls.removeCoupon(), Middleware.ensureNotCallingSelf, Middleware.requireTransaction, this.removeCoupon.bind(this));
    }

}
export = PaymentRoute