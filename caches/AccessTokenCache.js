
var IntegrationMember = require('../models/IntegrationMember');
var Config = require('../Config');
var CacheHelper = require('./CacheHelper');

/**
* Token cache
* For quick access to oauth access token and related details
*/
var AccessTokenCache = (function () {
    function AccessTokenCache() {
    }
    /** Get details for token (integration, user id) **/
    AccessTokenCache.prototype.getAccessTokenDetails = function (token) {
        return CacheHelper.get('at-' + token);
    };

    /** Add token to cache**/
    AccessTokenCache.prototype.addToken = function (integrationMember, expireAfter) {
        if (typeof expireAfter === "undefined") { expireAfter = Config.get('access_token.expiry'); }
        return null;
    };

    /** Remove token from cache **/
    AccessTokenCache.prototype.removeToken = function (token) {
        return null;
    };
    return AccessTokenCache;
})();

module.exports = AccessTokenCache;

//# sourceMappingURL=AccessTokenCache.js.map
