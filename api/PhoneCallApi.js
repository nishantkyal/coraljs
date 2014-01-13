
var ApiConstants = require('./ApiConstants');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var PhoneCallDelegate = require('../delegates/PhoneCallDelegate');
var AccessControl = require('../middleware/AccessControl');
var ValidateRequest = require('../middleware/ValidateRequest');

/**
* API calls for managing phone calls
*/
var PhoneCallApi = (function () {
    function PhoneCallApi(app) {
        var phoneCallDelegate = new PhoneCallDelegate();

        /**
        * Create call
        * Allow via searchntalk.com only
        **/
        app.put(ApiUrlDelegate.phoneCall(), AccessControl.allowDashboard, function (req, res) {
        });

        /**
        * Update call
        */
        app.post(ApiUrlDelegate.phoneCallById(), AccessControl.allowDashboard, function (req, res) {
        });

        /**
        * Reschedule call
        * Allow user or expert
        **/
        app.post(ApiUrlDelegate.phoneCallReschedule(), AccessControl.allowDashboard, function (req, res) {
        });

        /**
        * Cancel call
        * Allow user or expert
        **/
        app.post(ApiUrlDelegate.phoneCallCancel(), AccessControl.allowDashboard, function (req, res) {
        });

        /**
        * Get call details
        * Allow user or expert
        */
        app.get(ApiUrlDelegate.phoneCallById(), AccessControl.allowDashboard, function (req, res) {
            // TODO: Allow search by caller, callee, incoming/outgoing, date range
        });

        /**
        * Get all calls
        * Allow searchntalk.com
        */
        app.get(ApiUrlDelegate.phoneCall(), ValidateRequest.requireFilters, AccessControl.allowDashboard, function (req, res) {
            var filters = req.body[ApiConstants.FILTERS];

            phoneCallDelegate.search(filters).then(function handleCallSearched(response) {
                res.json(response);
            }, function handleCallSearchFailed(error) {
                res.status(500).json(error);
            });
        });
    }
    return PhoneCallApi;
})();

module.exports = PhoneCallApi;

//# sourceMappingURL=PhoneCallApi.js.map
