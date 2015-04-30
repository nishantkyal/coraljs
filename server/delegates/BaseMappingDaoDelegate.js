var _ = require('underscore');
var log4js = require('log4js');
var q = require('q');
var MysqlDao = require('../dao/MysqlDao');
var Utils = require('../common/Utils');
var BaseModel = require('../models/BaseModel');
var BaseMappingDaoDelegate = (function () {
    function BaseMappingDaoDelegate(dao) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }
    BaseMappingDaoDelegate.prototype.get = function (id, options, foreignKeys, transaction) {
        if (foreignKeys === void 0) { foreignKeys = []; }
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        id = [].concat(id);
        if (id.length > 1)
            return this.search({ 'id': id }, options, foreignKeys);
        if (id.length === 1)
            return this.find({ 'id': id }, options, foreignKeys);
    };
    BaseMappingDaoDelegate.prototype.find = function (search, options, foreignKeys, transaction) {
        if (foreignKeys === void 0) { foreignKeys = []; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.find(search, options, transaction).then(function processForeignKeys(result) {
            if (Utils.isNullOrEmpty(result))
                return result;
            var foreignKeyTasks = _.map(foreignKeys, function (key) {
                self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                var delegate = key.referenced_table.DELEGATE;
                return delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)));
            });
            return [result, q.all(foreignKeyTasks)];
        }).spread(function handleIncludesProcessed(result) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var results = args[0];
            _.each(results, function (resultSet, index) {
                result.set(foreignKeys[index].getSourcePropertyName(), resultSet);
            });
            return result;
        }).fail(function handleFailure(error) {
            self.logger.error('Error occurred while finding %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
            throw error;
        });
    };
    BaseMappingDaoDelegate.prototype.search = function (search, options, foreignKeys, transaction) {
        if (foreignKeys === void 0) { foreignKeys = []; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.search(search, options, transaction).then(function processIncludes(baseSearchResults) {
            if (Utils.isNullOrEmpty(baseSearchResults))
                return baseSearchResults;
            var foreignKeyTasks = _.map(foreignKeys, function (key) {
                self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
                var delegate = key.referenced_table.DELEGATE;
                return delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))));
            });
            return [baseSearchResults, q.all(foreignKeyTasks)];
        }).spread(function handleIncludesProcessed(baseSearchResults) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var results = args[0];
            _.each(baseSearchResults, function (baseSearchResult) {
                _.each(results, function (resultSet, index) {
                    baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                });
            });
            return baseSearchResults;
        }).fail(function handleFailure(error) {
            self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
            throw error;
        });
    };
    BaseMappingDaoDelegate.prototype.searchWithIncludes = function (search, options, includes, transaction) {
        if (options === void 0) { options = {}; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.search(search, options, transaction).then(function searchComplete(baseSearchResults) {
            return self.processIncludes(baseSearchResults, search, options, includes, transaction);
        });
    };
    BaseMappingDaoDelegate.prototype.processIncludes = function (baseSearchResults, search, options, includes, transaction) {
        if (Utils.isNullOrEmpty(baseSearchResults))
            return baseSearchResults;
        var self = this;
        var foreignKeyTasks = [];
        var foreignKeys = [];
        _.each(includes, function (include) {
            if (typeof include === 'string') {
                var tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(include);
                if (!Utils.isNullOrEmpty(tempForeignKey)) {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    foreignKeyTasks.push(delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, null, transaction));
                }
            }
            else {
                var tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(_.keys(include)[0]);
                if (!Utils.isNullOrEmpty(tempForeignKey)) {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    foreignKeyTasks.push(delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, _.values(include)[0]), transaction);
                }
            }
        });
        return q.all(foreignKeyTasks).then(function handleIncludesProcessed() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var results = args[0];
            _.each(baseSearchResults, function (baseSearchResult) {
                _.each(results, function (resultSet, index) {
                    baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                });
            });
            return baseSearchResults;
        }).fail(function handleFailure(error) {
            self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
            throw error;
        });
    };
    BaseMappingDaoDelegate.prototype.create = function (mappingObject, object, transaction) {
        var self = this;
        var tempObject = _.clone(object);
        if (Utils.isNullOrEmpty(object))
            throw new Error('Invalid data. Trying to create object with null data');
        var fk = this.dao.modelClass['FOREIGN_KEYS'][0];
        return fk.referenced_table.DELEGATE.create(object).then(function created(item) {
            mappingObject[fk.getSourcePropertyName() + '_id'] = item.id;
            return self.dao.create(mappingObject, transaction);
        }).fail(function createFailed() {
            return fk.referenced_table.DELEGATE.find(tempObject).then(function fetched(item) {
                mappingObject[fk.getSourcePropertyName() + '_id'] = item.id;
                return self.dao.create(mappingObject, transaction);
            });
        });
    };
    BaseMappingDaoDelegate.prototype.update = function (criteria, newValues, transaction) {
        return this.dao.update(criteria, newValues, transaction);
    };
    BaseMappingDaoDelegate.prototype.delete = function (criteria, softDelete, transaction) {
        if (softDelete === void 0) { softDelete = true; }
        return this.dao.delete(criteria, transaction);
    };
    BaseMappingDaoDelegate.prototype.save = function (object, dbTransaction) {
        return Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction);
    };
    return BaseMappingDaoDelegate;
})();
module.exports = BaseMappingDaoDelegate;
//# sourceMappingURL=BaseMappingDaoDelegate.js.map