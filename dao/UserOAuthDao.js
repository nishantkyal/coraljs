var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('../dao/BaseDAO');
var UserOAuth = require('../models/UserOauth');
var MysqlDelegate = require('../delegates/MysqlDelegate');

/**
DAO for User
No business logic goes here, only data access layer
**/
var UserAuthDao = (function (_super) {
    __extends(UserAuthDao, _super);
    function UserAuthDao() {
        _super.apply(this, arguments);
    }
    UserAuthDao.updateTokenForProviderAndOAuthUid = /**
    * Update token for given provider and oauth_uid without knowing the user
    * @param providerId
    * @param oauthUserId
    * @param userOAuth
    * @param callback
    */
    function (providerId, oauthUserId, userOAuth, callback) {
        var values = [];
        var updateFields = [];

        if (userOAuth.getAccessToken()) {
            updateFields.push('access_token = ?');
            values.push(userOAuth.getAccessToken());
        }

        if (userOAuth.getAccessTokenExpiry()) {
            updateFields.push('access_token_expiry = ?');
            values.push(userOAuth.getAccessTokenExpiry());
        }

        if (userOAuth.getRefreshToken()) {
            updateFields.push('refresh_token = ?');
            values.push(userOAuth.getRefreshToken());
        }

        if (userOAuth.getRefreshTokenExpiry()) {
            updateFields.push('refresh_token_expiry = ?');
            values.push(userOAuth.getRefreshTokenExpiry());
        }

        values.push(userOAuth.getProviderId());
        values.push(userOAuth.getOauthUserId());

        var query = 'UPDATE ' + this.getTableName() + ' SET ' + updateFields.join(',') + ' WHERE provider_id = ? AND oauth_user_id = ?';
        MysqlDelegate.executeQuery(query, values, callback);
    };

    UserAuthDao.getTableName = function () {
        return 'user_oauth';
    };
    return UserAuthDao;
})(BaseDAO);

module.exports = UserAuthDao;

//# sourceMappingURL=UserOAuthDao.js.map
