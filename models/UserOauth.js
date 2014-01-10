var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var BaseModel = require('./BaseModel');

/**
* Bean class for User's oauth settings (FB, LinkedIn tokens)
*/
var UserOauth = (function (_super) {
    __extends(UserOauth, _super);
    function UserOauth() {
        _super.apply(this, arguments);
    }
    /* Getters */
    UserOauth.prototype.getUserId = function () {
        return this.user_id;
    };
    UserOauth.prototype.getProviderId = function () {
        return this.provider_id;
    };
    UserOauth.prototype.getOauthUserId = function () {
        return this.oauth_user_id;
    };
    UserOauth.prototype.getAccessToken = function () {
        return this.access_token;
    };
    UserOauth.prototype.getAccessTokenExpiry = function () {
        return this.access_token_expiry;
    };
    UserOauth.prototype.getRefreshToken = function () {
        return this.refresh_token;
    };
    UserOauth.prototype.getRefreshTokenExpiry = function () {
        return this.refresh_token_expiry;
    };
    UserOauth.prototype.isValid = function () {
        return this.getOauthUserId() && this.getProviderId() && (this.getAccessToken() || this.getRefreshToken());
    };

    /* Setters */
    UserOauth.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    UserOauth.prototype.setProviderId = function (val) {
        this.provider_id = val;
    };
    UserOauth.prototype.setOauthUserId = function (val) {
        this.oauth_user_id = val;
    };
    UserOauth.prototype.setAccessToken = function (val) {
        this.access_token = val;
    };
    UserOauth.prototype.setAccessTokenExpiry = function (val) {
        this.access_token_expiry = val;
    };
    UserOauth.prototype.setRefreshToken = function (val) {
        this.refresh_token = val;
    };
    UserOauth.prototype.setRefreshTokenExpiry = function (val) {
        this.refresh_token = val;
    };
    UserOauth.TABLE_NAME = 'user_oauth';
    return UserOauth;
})(BaseModel);

module.exports = UserOauth;

