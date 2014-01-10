
var Utils = require('../Utils');

/**
* Base class for Models
*/
var BaseModel = (function () {
    function BaseModel(data) {
        if (typeof data === "undefined") { data = {}; }
        for (var classProperty in this.__proto__) {
            if (typeof this.__proto__[classProperty] == 'function' && classProperty.match(/^set/) != null) {
                var key = Utils.camelToUnderscore(classProperty.replace(/^set/, ''));
                this[key] = data[key];
            }
        }
    }
    /* Getters */
    BaseModel.prototype.getId = function () {
        return this.id;
    };
    BaseModel.prototype.getCreated = function () {
        return this.created;
    };
    BaseModel.prototype.getUpdated = function () {
        return this.updated;
    };
    BaseModel.prototype.getDeleted = function () {
        return this.deleted;
    };

    /* Setters */
    BaseModel.prototype.setId = function (val) {
        this.id = val;
    };
    BaseModel.prototype.setCreated = function (val) {
        this.created = val;
    };
    BaseModel.prototype.setUpdated = function (val) {
        this.updated = val;
    };
    BaseModel.prototype.setDeleted = function (val) {
        this.deleted = val;
    };
    BaseModel.PRIMARY_KEY = 'id';
    return BaseModel;
})();

module.exports = BaseModel;

