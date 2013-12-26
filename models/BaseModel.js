
var Utils = require('../Utils');

/**
* Base class for Models
*/
var BaseModel = (function () {
    function BaseModel(data) {
        if (typeof data === "undefined") { data = {}; }
        this.init(data);
        for (var key in this) {
            if (typeof this[key] != 'function') {
                this[key] = data[key];
            }
        }
    }
    BaseModel.prototype.init = function (data) {
        Utils.copyProperties(data, this);
    };

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
    BaseModel.TABLE_NAME = null;
    BaseModel.PRIMARY_KEY = 'id';
    return BaseModel;
})();

module.exports = BaseModel;

//# sourceMappingURL=BaseModel.js.map
