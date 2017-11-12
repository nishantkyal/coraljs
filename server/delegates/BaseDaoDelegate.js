"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _ = require("underscore");
const log4js = require("log4js");
const moment = require("moment");
const MysqlDao = require("../dao/MysqlDao");
const Utils = require("../common/Utils");
const BaseModel = require("../models/BaseModel");
const GlobalIdDelegate = require("../delegates/GlobalIDDelegate");
class BaseDaoDelegate {
    constructor(dao) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }
    get(id, options = {}, foreignKeys = [], transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
            id = [].concat(id);
            if (id.length > 1)
                return this.search({ 'id': id }, options, foreignKeys, transaction);
            if (id.length === 1)
                return this.find({ 'id': id }, options, foreignKeys, transaction);
        });
    }
    find(search, options = {}, foreignKeys = [], transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            options = options || {};
            options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
            try {
                var result = yield this.dao.find(search, options, transaction);
                if (Utils.isNullOrEmpty(result))
                    return result;
                var foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                    return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
                });
                foreignKeys = _.filter(foreignKeys, function (key) {
                    return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
                });
                var results = _.map(foreignKeys, function (key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                        var delegate = key.referenced_table.DELEGATE;
                        return delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)), null, foreignKeysToPassOn);
                    });
                });
                _.each(results, function (resultSet, index) {
                    result.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                });
            }
            catch (error) {
                self.logger.error('Error occurred while finding %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
                throw error;
            }
            return result;
        });
    }
    search(search, options = {}, foreignKeys = [], transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            options = options || {};
            options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
            var baseSearchResults = yield this.dao.search(search, options, transaction);
            if (Utils.isNullOrEmpty(baseSearchResults))
                return baseSearchResults;
            var foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
            });
            foreignKeys = _.filter(foreignKeys, function (key) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
            });
            var foreignKeyResults = _.compact(_.map(foreignKeys, function (key) {
                return __awaiter(this, void 0, void 0, function* () {
                    self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
                    var delegate = key.referenced_table.DELEGATE;
                    return delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))), null, foreignKeysToPassOn);
                });
            }));
            _.each(baseSearchResults, function (baseSearchResult) {
                _.each(foreignKeyResults, function (resultSet, index) {
                    baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                });
            });
            return baseSearchResults;
        });
    }
    searchWithIncludes(search, options = {}, includes, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            options = options || {};
            options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
            var baseSearchResults = yield this.dao.search(search, options, transaction);
            if (Utils.isNullOrEmpty(baseSearchResults))
                return baseSearchResults;
            return self.processIncludes(baseSearchResults, search, options, includes, transaction);
        });
    }
    processIncludes(baseSearchResults, search, options, includes, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var foreignKeys = [];
            try {
                var results = _.map(includes, function (include) {
                    return __awaiter(this, void 0, void 0, function* () {
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
                });
                _.each(baseSearchResults, function (baseSearchResult) {
                    _.each(results, function (resultSet, index) {
                        baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                    });
                });
            }
            catch (error) {
                self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
                throw error;
            }
            return baseSearchResults;
        });
    }
    create(object, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    update(criteria, newValues, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            newValues[BaseModel.COL_UPDATED] = new Date().getTime();
            delete newValues[BaseModel.COL_CREATED];
            delete newValues[BaseModel.COL_ID];
            return this.dao.update(criteria, newValues, transaction);
        });
    }
    delete(criteria, softDelete = true, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Utils.isNullOrEmpty(criteria))
                throw new Error('Please specify what to delete');
            if (softDelete)
                return this.dao.update(criteria, { 'deleted': moment().valueOf() }, transaction);
            else
                return this.dao.delete(criteria, transaction);
        });
    }
    save(object, dbTransaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction);
        });
    }
}
module.exports = BaseDaoDelegate;
//# sourceMappingURL=BaseDaoDelegate.js.map