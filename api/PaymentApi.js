
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');

/**
* API calls for payments
*/
var PaymentApi = (function () {
    function PaymentApi(app) {
        /** Search payment */
        app.get(ApiUrlDelegate.payment(), function (req, res) {
        });

        /** Get by id */
        app.get(ApiUrlDelegate.paymentById(), function (req, res) {
        });

        /** Create new  */
        app.put(ApiUrlDelegate.payment(), function (req, res) {
        });

        /** Update */
        app.post(ApiUrlDelegate.paymentById(), function (req, res) {
        });

        /** Delete */
        app.delete(ApiUrlDelegate.paymentById(), function (req, res) {
        });
    }
    return PaymentApi;
})();

module.exports = PaymentApi;

//# sourceMappingURL=PaymentApi.js.map
