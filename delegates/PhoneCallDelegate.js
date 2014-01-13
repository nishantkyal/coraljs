var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('underscore');

var Utils = require('../Utils');

var PhoneCallDao = require('../dao/PhoneCallDao');
var BaseDAODelegate = require('./BaseDaoDelegate');

var PhoneCallDelegate = (function (_super) {
    __extends(PhoneCallDelegate, _super);
    function PhoneCallDelegate() {
        _super.apply(this, arguments);
    }
    PhoneCallDelegate.prototype.callsByUser = function (user_id, filters, fields) {
        filters['user_id'] = user_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, { 'fields': fields });
    };

    PhoneCallDelegate.prototype.callsToExpert = function (expert_id, filters, fields) {
        filters['expert_id'] = expert_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, { 'fields': fields });
    };

    PhoneCallDelegate.prototype.getDao = function () {
        return new PhoneCallDao();
    };
    return PhoneCallDelegate;
})(BaseDAODelegate);

module.exports = PhoneCallDelegate;

//# sourceMappingURL=PhoneCallDelegate.js.map
