var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var BaseDaoDelegate = require('./BaseDaoDelegate');

var IntegrationDAO = require('../dao/IntegrationDao');
var Integration = require('../models/Integration');
var Utils = require('../Utils');

/**
* Delegate class for third party integration data
*/
var IntegrationDelegate = (function (_super) {
    __extends(IntegrationDelegate, _super);
    function IntegrationDelegate() {
        _super.apply(this, arguments);
    }
    IntegrationDelegate.prototype.get = function (id, fields) {
        return _super.prototype.get.call(this, id, fields).then(function integrationFetched(result) {
            return new Integration(result);
        });
    };

    IntegrationDelegate.prototype.getAll = function () {
        return IntegrationDAO.getAll();
    };

    IntegrationDelegate.prototype.getMultiple = function (ids) {
        return this.getDao().search({ 'integration_id': ids });
    };

    IntegrationDelegate.prototype.resetSecret = function (integrationId) {
        var newSecret = Utils.getRandomString(30);
        return this.getDao().update({ 'integration_id': integrationId }, { 'secret': newSecret }).then(function handleSecretReset() {
            return newSecret;
        });
    };

    IntegrationDelegate.prototype.getDao = function () {
        return new IntegrationDAO();
    };
    return IntegrationDelegate;
})(BaseDaoDelegate);

module.exports = IntegrationDelegate;

//# sourceMappingURL=IntegrationDelegate.js.map
