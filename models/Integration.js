var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

/**
Bean class for Integration
**/
var Integration = (function (_super) {
    __extends(Integration, _super);
    function Integration() {
        _super.apply(this, arguments);
    }
    /** Getters */
    Integration.prototype.getIntegrationId = function () {
        return this.integration_id;
    };
    Integration.prototype.getTitle = function () {
        return this.title;
    };
    Integration.prototype.getWebsiteUrl = function () {
        return this.website_url;
    };
    Integration.prototype.getRedirectUrl = function () {
        return this.redirect_url;
    };
    Integration.prototype.getType = function () {
        return this.integration_type;
    };
    Integration.prototype.getSecret = function () {
        return this.secret;
    };
    Integration.prototype.getStatus = function () {
        return this.status;
    };

    /** Setters */
    Integration.prototype.setIntegrationId = function (val) {
        this.integration_id = val;
    };
    Integration.prototype.setTitle = function (val) {
        this.title = val;
    };
    Integration.prototype.setWebsiteUrl = function (val) {
        this.website_url = val;
    };
    Integration.prototype.setRedirectUrl = function (val) {
        this.redirect_url = val;
    };
    Integration.prototype.setType = function (val) {
        this.integration_type = val;
    };
    Integration.prototype.setSecret = function (val) {
        this.secret = val;
    };
    Integration.prototype.setStatus = function (val) {
        this.status = val;
    };
    Integration.TABLE_NAME = 'integration';
    Integration.PRIMARY_KEY = 'integration_id';
    return Integration;
})(BaseModel);

module.exports = Integration;

//# sourceMappingURL=Integration.js.map
