/**
* Class to hold all API URLs
* Used to keep API URLs consistent between SearchNTalk and Coral
* Note: Not using a generator for fine grained control and prevent unexpected behaviour
*/
var ApiUrlDelegate = (function () {
    function ApiUrlDelegate() {
    }
    ApiUrlDelegate.expert = /* URL patterns for expert API */
    function () {
        return this.get('/rest/expert');
    };
    ApiUrlDelegate.expertById = function (expertId) {
        return this.get('/rest/expert/:expertId', { expertId: expertId });
    };
    ApiUrlDelegate.expertActivitySummary = function (expertId) {
        return this.get('/rest/expert/:expertId/activity/summary', { expertId: expertId });
    };

    ApiUrlDelegate.user = /* URL patterns for user API */
    function () {
        return this.get('/rest/user');
    };
    ApiUrlDelegate.userAuthentication = function () {
        return this.get('/rest/user/authentication');
    };
    ApiUrlDelegate.userById = function (userId) {
        return this.get('/rest/user/:userId', { userId: userId });
    };
    ApiUrlDelegate.userPasswordResetToken = function (userId) {
        return this.get('/rest/user/:userId/passwordResetToken', { userId: userId });
    };
    ApiUrlDelegate.emailVerificationToken = function (userId) {
        return this.get('/rest/user/:userId/emailVerification', { userId: userId });
    };
    ApiUrlDelegate.userProfile = function (userId) {
        return this.get('/rest/user/:userId/profile', { userId: userId });
    };
    ApiUrlDelegate.userIntegrationDetails = function (userId, integrationId) {
        return this.get('/rest/user/:userId/integration/:integrationId', { userId: userId, integrationId: integrationId });
    };
    ApiUrlDelegate.userActivitySummary = function (userId) {
        return this.get('/rest/user/:userId/activity/summary', { userId: userId });
    };
    ApiUrlDelegate.userTransactionBalance = function (userId) {
        return this.get('/rest/user/:userId/transactions/balance', { userId: userId });
    };

    ApiUrlDelegate.userOAuth = /* URL patterns for user oauth (FB, LinkedIn ..) */
    function () {
        return this.get('/rest/user/oauth');
    };
    ApiUrlDelegate.userOAuthToken = function (userId, type) {
        return this.get('/rest/user/:userId/oauth/:type/token', { userId: userId, type: type });
    };

    ApiUrlDelegate.decision = /** URL patterns for OAuth provider **/
    function () {
        return this.get('/rest/oauth/decision');
    };
    ApiUrlDelegate.token = function () {
        return this.get('/rest/oauth/token');
    };

    ApiUrlDelegate.schedule = /* URL patterns for expert schedules */
    function () {
        return this.get('/rest/schedule');
    };
    ApiUrlDelegate.scheduleById = function (scheduleId) {
        return this.get('/rest/schedule/:scheduleId');
    };
    ApiUrlDelegate.scheduleByExpert = function (expertId) {
        return this.get('/rest/expert/:expertId/schedule');
    };

    ApiUrlDelegate.integration = /* URL patterns for third party integration */
    function () {
        return this.get('/rest/integration');
    };
    ApiUrlDelegate.integrationById = function (integrationId) {
        return this.get('/rest/integration/:integrationId');
    };
    ApiUrlDelegate.integrationSecretReset = function (integrationId) {
        return this.get('/rest/integration/:integrationId/secret/reset');
    };
    ApiUrlDelegate.integrationMember = function (integrationId) {
        return this.get('/rest/integration/:integrationId/member');
    };
    ApiUrlDelegate.integrationMemberById = function (integrationId, memberId) {
        return this.get('/rest/integration/:integrationId/member/:memberId');
    };
    ApiUrlDelegate.ownerActivitySummary = function (integrationId, memberId) {
        return this.get('/rest/integration/:integrationId/activity/summary');
    };

    ApiUrlDelegate.payment = /** URL patterns for payments **/
    function () {
        return this.get('/rest/payment');
    };
    ApiUrlDelegate.paymentById = function (paymentId) {
        return this.get('/rest/payment/:paymentId');
    };

    ApiUrlDelegate.payoutDetail = /** URL patterns for payout details **/
    function () {
        return this.get('/rest/payout-detail');
    };
    ApiUrlDelegate.payoutDetailById = function (payoutDetailId) {
        return this.get('/rest/payout-detail/:payoutDetailId');
    };

    ApiUrlDelegate.phoneCall = /** URL patterns for phone calls **/
    function () {
        return this.get('/rest/call');
    };
    ApiUrlDelegate.phoneCallById = function (callId) {
        return this.get('/rest/call/:callId');
    };
    ApiUrlDelegate.phoneCallReschedule = function (callId) {
        return this.get('/rest/call/:callId/reschedule');
    };
    ApiUrlDelegate.phoneCallCancel = function (callId) {
        return this.get('/rest/call/:callId/cancel');
    };

    ApiUrlDelegate.phoneNumber = /** URL patterns for phone numbers **/
    function () {
        return this.get('/rest/phone-number');
    };
    ApiUrlDelegate.phoneNumberById = function (phoneNumberId) {
        return this.get('/rest/phone-number/:phoneNumberId');
    };

    ApiUrlDelegate.transaction = /** URL patterns for transaction **/
    function () {
        return this.get('/rest/transaction');
    };
    ApiUrlDelegate.transactionById = function (transactionId) {
        return this.get('/rest/transaction/:transactionId');
    };
    ApiUrlDelegate.transactionItem = function () {
        return this.get('/rest/transaction/:transactionId/item');
    };
    ApiUrlDelegate.transactionItemById = function (transactionId, itemId) {
        return this.get('/rest/transaction/:transactionId/item/:itemId');
    };

    ApiUrlDelegate.get = /**
    * Helper method to generate URLs with values substituted for parameters (if supplied)
    * @param urlPattern
    * @param values
    * @returns {string}
    */
    function (urlPattern, values) {
        if (values)
            for (var key in values)
                if (values[key] != null)
                    urlPattern = urlPattern.replace(new RegExp(':' + key), values[key]);
        return urlPattern;
    };
    return ApiUrlDelegate;
})();

module.exports = ApiUrlDelegate;

//# sourceMappingURL=ApiUrlDelegate.js.map
