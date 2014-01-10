/**
* Constants used on query strings, headers of API calls
*/
var ApiConstants = (function () {
    function ApiConstants() {
    }
    ApiConstants.FIELDS = 'fields';
    ApiConstants.FILTERS = 'filters';

    ApiConstants.USER_ID = 'userId';
    ApiConstants.EXPERT_ID = 'expertId';
    ApiConstants.INTEGRATION_ID = 'integrationId';
    ApiConstants.PROFILE_TYPE = 'profileType';
    ApiConstants.PASSWORD = 'pass';
    ApiConstants.PHONE_NUMBER_ID = 'phoneNumberId';

    ApiConstants.USER = 'user';
    ApiConstants.INTEGRATION = 'integration';
    ApiConstants.EXPERT = 'expert';
    ApiConstants.PHONE_NUMBER = 'phoneNumber';
    return ApiConstants;
})();

module.exports = ApiConstants;

