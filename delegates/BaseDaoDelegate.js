///<reference path='../_references.d.ts'/>
var _ = require('underscore');
var log4js = require('log4js');
var q = require('q');
var moment = require('moment');
var MysqlDao = require('../dao/MysqlDao');
var Utils = require('../common/Utils');
var BaseModel = require('../models/BaseModel');
var GlobalIdDelegate = require('../delegates/GlobalIDDelegate');
var BaseDaoDelegate = (function () {
    function BaseDaoDelegate(dao) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }
    BaseDaoDelegate.prototype.get = function (id, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        id = [].concat(id);
        if (id.length > 1)
            return this.search({ 'id': id }, options, foreignKeys, transaction);
        if (id.length === 1)
            return this.find({ 'id': id }, options, foreignKeys, transaction);
    };
    BaseDaoDelegate.prototype.find = function (search, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.find(search, options, transaction).then(function processForeignKeys(result) {
            if (Utils.isNullOrEmpty(result))
                return result;
            var foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
            });
            foreignKeys = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
            });
            var foreignKeyTasks = _.map(foreignKeys, function (key) {
                self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                var delegate = key.referenced_table.DELEGATE;
                return delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)), null, foreignKeysToPassOn);
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
    /*
     * Perform search based on search query
     * Also fetch joint fields
     */
    BaseDaoDelegate.prototype.search = function (search, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.search(search, options, transaction).then(function processIncludes(baseSearchResults) {
            if (Utils.isNullOrEmpty(baseSearchResults))
                return baseSearchResults;
            var foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
            });
            foreignKeys = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
            });
            var foreignKeyTasks = _.map(foreignKeys, function (key) {
                self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
                var delegate = key.referenced_table.DELEGATE;
                return delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))), null, foreignKeysToPassOn);
            });
            return [baseSearchResults, q.all(_.compact(foreignKeyTasks))];
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
    BaseDaoDelegate.prototype.searchWithIncludes = function (search, options, includes, transaction) {
        if (options === void 0) { options = {}; }
        var self = this;
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
        return this.dao.search(search, options, transaction).then(function searchComplete(baseSearchResults) {
            if (Utils.isNullOrEmpty(baseSearchResults))
                return baseSearchResults;
            return self.processIncludes(baseSearchResults, search, options, includes, transaction);
        });
    };
    BaseDaoDelegate.prototype.processIncludes = function (baseSearchResults, search, options, includes, transaction) {
        var self = this;
        var foreignKeys = [];
        var foreignKeyTasks = _.map(includes, function (include) {
            if (typeof include === 'string') {
                var tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(include);
                if (!Utils.isNullOrEmpty(tempForeignKey)) {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    return delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, null, transaction);
                }
            }
            else {
                var tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(_.keys(include)[0]);
                if (!Utils.isNullOrEmpty(tempForeignKey)) {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    return delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, _.values(include)[0], transaction);
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
    BaseDaoDelegate.prototype.create = function (object, transaction) {
        if (Utils.isNullOrEmpty(object))
            throw new Error('Invalid data. Trying to create object with null data');
        var self = this;
        function prepareData(data) {
            var generatedId = new GlobalIdDelegate().generate(self.dao.modelClass.TABLE_NAME);
            data[BaseModel.COL_ID] = generatedId;
            data[BaseModel.COL_CREATED] = moment().valueOf();
            data[BaseModel.COL_UPDATED] = moment().valueOf();
            return data;
        }
        ;
        var newObject = (Utils.getObjectType(object) === 'Array') ? _.map(object, prepareData) : prepareData(object);
        return this.dao.create(newObject, transaction);
    };
    BaseDaoDelegate.prototype.update = function (criteria, newValues, transaction) {
        // Compose update statement based on newValues
        newValues[BaseModel.COL_UPDATED] = new Date().getTime();
        delete newValues[BaseModel.COL_CREATED];
        delete newValues[BaseModel.COL_ID];
        return this.dao.update(criteria, newValues, transaction);
    };
    BaseDaoDelegate.prototype.delete = function (criteria, softDelete, transaction) {
        if (softDelete === void 0) { softDelete = true; }
        if (Utils.isNullOrEmpty(criteria))
            throw new Error('Please specify what to delete');
        if (softDelete)
            return this.dao.update(criteria, { 'deleted': moment().valueOf() }, transaction);
        else
            return this.dao.delete(criteria, transaction);
    };
    BaseDaoDelegate.prototype.save = function (object, dbTransaction) {
        return Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction);
    };
    return BaseDaoDelegate;
})();
module.exports = BaseDaoDelegate;
//# sourceMappingURL=BaseDaoDelegate.js.map