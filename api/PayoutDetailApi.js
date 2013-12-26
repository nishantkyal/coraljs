
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');

/**
* API calls for managing payment details
* Bank/paypal details for users to which they can withdraw money
*/
var PayoutDetailApi = (function () {
    function PayoutDetailApi(app) {
        /** Search payout-detail */
        app.get(ApiUrlDelegate.payoutDetail(), function (req, res) {
        });

        /** Get by id */
        app.get(ApiUrlDelegate.payoutDetailById(), function (req, res) {
        });

        /** Create new  */
        app.put(ApiUrlDelegate.payoutDetail(), function (req, res) {
        });

        /** Update */
        app.post(ApiUrlDelegate.payoutDetailById(), function (req, res) {
        });

        /** Delete */
        app.delete(ApiUrlDelegate.payoutDetailById(), function (req, res) {
        });
    }
    return PayoutDetailApi;
})();

module.exports = PayoutDetailApi;

//# sourceMappingURL=PayoutDetailApi.js.map
