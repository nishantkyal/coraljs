var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseModel = require('./BaseModel');

/**
Bean class for Phone call
**/
var PhoneCall = (function (_super) {
    __extends(PhoneCall, _super);
    function PhoneCall() {
        _super.apply(this, arguments);
    }
    /* Getters */
    PhoneCall.prototype.getCallId = function () {
        return this.call_id;
    };
    PhoneCall.prototype.getCallerId = function () {
        return this.caller_id;
    };
    PhoneCall.prototype.getExpertId = function () {
        return this.expert_id;
    };
    PhoneCall.prototype.getIntegrationId = function () {
        return this.integration_id;
    };
    PhoneCall.prototype.getStartTime = function () {
        return this.start_time;
    };
    PhoneCall.prototype.getDuration = function () {
        return this.duration;
    };
    PhoneCall.prototype.getStatus = function () {
        return this.status;
    };
    PhoneCall.prototype.getPrice = function () {
        return this.price;
    };
    PhoneCall.prototype.getPriceCurrency = function () {
        return this.price_currency;
    };
    PhoneCall.prototype.getCost = function () {
        return this.cost;
    };
    PhoneCall.prototype.getCostCurrency = function () {
        return this.cost_currency;
    };
    PhoneCall.prototype.getAgenda = function () {
        return this.agenda;
    };
    PhoneCall.prototype.getRecorded = function () {
        return this.recorded;
    };
    PhoneCall.prototype.getExtension = function () {
        return this.extension;
    };
    PhoneCall.prototype.getNumReschedules = function () {
        return this.num_reschedules;
    };

    /* Setters */
    PhoneCall.prototype.setCallId = function (val) {
        this.call_id = val;
    };
    PhoneCall.prototype.setCallerId = function (val) {
        this.caller_id = val;
    };
    PhoneCall.prototype.setExpertId = function (val) {
        this.expert_id = val;
    };
    PhoneCall.prototype.setIntegrationId = function (val) {
        this.integration_id = val;
    };
    PhoneCall.prototype.setStartTime = function (val) {
        this.start_time = val;
    };
    PhoneCall.prototype.setDuration = function (val) {
        this.duration = val;
    };
    PhoneCall.prototype.setStatus = function (val) {
        this.status = val;
    };
    PhoneCall.prototype.setPrice = function (val) {
        this.price = val;
    };
    PhoneCall.prototype.setPriceCurrency = function (val) {
        this.price_currency = val;
    };
    PhoneCall.prototype.setCost = function (val) {
        this.cost = val;
    };
    PhoneCall.prototype.setCostCurrency = function (val) {
        this.cost_currency = val;
    };
    PhoneCall.prototype.setAgenda = function (val) {
        this.agenda = val;
    };
    PhoneCall.prototype.setRecorded = function (val) {
        this.recorded = val;
    };
    PhoneCall.prototype.setExtension = function (val) {
        this.extension = val;
    };
    PhoneCall.prototype.setNumReschedules = function (val) {
        this.num_reschedules = val;
    };
    PhoneCall.TABLE_NAME = 'call';
    PhoneCall.PRIMARY_KEY = 'call_id';
    return PhoneCall;
})(BaseModel);

module.exports = PhoneCall;

//# sourceMappingURL=PhoneCall.js.map
