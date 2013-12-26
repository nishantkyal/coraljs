
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');

/**
* API calls for managing payment transactions
* Allow only through searchntalk.com
*/
var TransactionApi = (function () {
    function TransactionApi(app) {
        /** Create a new transaction **/
        app.put(ApiUrlDelegate.transaction(), function (req, res) {
            // Validate item to be added
        });

        /** Update transaction **/
        app.post(ApiUrlDelegate.transactionById(), function (req, res) {
        });

        /** Add item **/
        app.put(ApiUrlDelegate.transactionItem(), function (req, res) {
        });

        /**
        * Update item
        * Remove all rows for item and insert again
        **/
        app.post(ApiUrlDelegate.transactionItemById(), function (req, res) {
        });

        /**
        * Remove item
        */
        app.delete(ApiUrlDelegate.transactionItemById(), function (req, res) {
        });

        /**
        * Get transaction
        * Fields : [summary, items, discounts, invoice]
        **/
        app.get(ApiUrlDelegate.transactionById(), function (req, res) {
        });
    }
    return TransactionApi;
})();


module.exports = TransactionApi;

//# sourceMappingURL=TransactionApi.js.map
