var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

/**
Bean class for Integration member
**/
var IntegrationMember = (function (_super) {
    __extends(IntegrationMember, _super);
    function IntegrationMember() {
        _super.apply(this, arguments);
    }
    /** Getters */
    IntegrationMember.prototype.getIntegrationMemberId = function () {
        return this.integration_member_id;
    };
    IntegrationMember.prototype.getIntegrationId = function () {
        return this.integration_id;
    };
    IntegrationMember.prototype.getUserId = function () {
        return this.user_id;
    };
    IntegrationMember.prototype.getRole = function () {
        return this.role;
    };
    IntegrationMember.prototype.getAuthCode = function () {
        return this.auth_code;
    };
    IntegrationMember.prototype.getAccessToken = function () {
        return this.access_token;
    };
    IntegrationMember.prototype.getAccessTokenExpiry = function () {
        return this.access_token_expiry;
    };
    IntegrationMember.prototype.getRefreshToken = function () {
        return this.refresh_token;
    };
    IntegrationMember.prototype.getRefreshTokenExpiry = function () {
        return this.refresh_token_expiry;
    };

    IntegrationMember.prototype.isValid = function () {
        return !isNaN(this.getIntegrationId()) && !isNaN(this.getIntegrationMemberId()) && !isNaN(this.getRole());
    };

    /** Setters */
    IntegrationMember.prototype.setIntegrationMemberId = function (val) {
        this.integration_member_id = val;
    };
    IntegrationMember.prototype.setIntegrationId = function (val) {
        this.integration_id = val;
    };
    IntegrationMember.prototype.setUserId = function (val) {
        this.user_id = val;
    };
    IntegrationMember.prototype.setRole = function (val) {
        this.role = val;
    };
    IntegrationMember.prototype.setAuthCode = function (val) {
        this.auth_code = val;
    };
    IntegrationMember.prototype.setAccessToken = function (val) {
        this.access_token = val;
    };
    IntegrationMember.prototype.setAccessTokenExpiry = function (val) {
        this.access_token_expiry = val;
    };
    IntegrationMember.prototype.setRefreshToken = function (val) {
        this.refresh_token = val;
    };
    IntegrationMember.prototype.setRefreshTokenExpiry = function (val) {
        this.refresh_token_expiry = val;
    };
    IntegrationMember.TABLE_NAME = 'integration_member';
    IntegrationMember.PRIMARY_KEY = 'integration_member_id';
    return IntegrationMember;
})(BaseModel);

module.exports = IntegrationMember;

