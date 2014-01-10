var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var IntegrationMember = require('./IntegrationMember');

/**
* Bean class for Expert
*/
var Expert = (function (_super) {
    __extends(Expert, _super);
    function Expert() {
        _super.apply(this, arguments);
    }
    /** Getters */
    Expert.prototype.getRevenueShare = function () {
        return this.revenue_share;
    };
    Expert.prototype.getRevenueShareUnit = function () {
        return this.revenue_share_unit;
    };

    /** Setters */
    Expert.prototype.setRevenueShare = function (val) {
        this.revenue_share = val;
    };
    Expert.prototype.setRevenueShareUnit = function (val) {
        this.revenue_share_unit = val;
    };
    Expert.TABLE_NAME = 'integration_member';
    Expert.PRIMARY_KEY = 'integration_member_id';
    return Expert;
})(IntegrationMember);

