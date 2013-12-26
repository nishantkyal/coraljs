var log4js = require('log4js');


var Utils = require('../Utils');

var BaseDaoDelegate = (function () {
    function BaseDaoDelegate() {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }
    BaseDaoDelegate.prototype.get = function (id, fields) {
        return this.getDao().get(id, fields);
    };

    /**
    * Perform search based on seacrh query
    * Also fetch joint fields
    * @param search
    * @param fields
    * @param supplimentaryModel
    * @param supplimentaryModelFields
    * @returns {q.makePromise}
    */
    BaseDaoDelegate.prototype.search = function (search, options) {
        return this.getDao().search(search, options);
    };

    BaseDaoDelegate.prototype.create = function (object, transaction) {
        return this.getDao().create(object, transaction);
    };

    BaseDaoDelegate.prototype.update = function (criteria, newValues, transaction) {
        return this.getDao().update(criteria, newValues, transaction);
    };

    BaseDaoDelegate.prototype.delete = function (id, transaction) {
        return this.getDao().delete(id, transaction);
    };

    BaseDaoDelegate.prototype.getDao = function () {
        throw ('getDao method not implemented');
        return null;
    };
    return BaseDaoDelegate;
})();

module.exports = BaseDaoDelegate;

//# sourceMappingURL=BaseDaoDelegate.js.map
