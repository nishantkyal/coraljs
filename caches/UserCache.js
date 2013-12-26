
var User = require('../models/User');
var Config = '../Config';

/**
User Cache
1. Password reset tokens
**/
var UserCache = (function () {
    function UserCache() {
    }
    UserCache.prototype.getResetTokenUser = function (resetToken) {
        return null;
    };

    UserCache.prototype.addResetToken = function (token, user, expireAfter) {
        if (typeof expireAfter === "undefined") { expireAfter = Config.get('password_reset.expiry'); }
        return null;
    };
    return UserCache;
})();

module.exports = UserCache;

//# sourceMappingURL=UserCache.js.map
