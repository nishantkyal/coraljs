"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _ = require("underscore");
var log4js = require("log4js");
var MysqlDao = require("../dao/MysqlDao");
var Utils = require("../common/Utils");
var BaseModel = require("../models/BaseModel");
var GlobalIdDelegate = require("../delegates/GlobalIDDelegate");
var BaseDaoDelegate = (function () {
    function BaseDaoDelegate(dao) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }
    BaseDaoDelegate.prototype.get = function (id, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                options = options || {};
                options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
                id = [].concat(id);
                if (id.length > 1)
                    return [2 /*return*/, this.search({ 'id': id }, options, foreignKeys, transaction)];
                if (id.length === 1)
                    return [2 /*return*/, this.find({ 'id': id }, options, foreignKeys, transaction)];
                return [2 /*return*/];
            });
        });
    };
    BaseDaoDelegate.prototype.find = function (search, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self, result, foreignKeysToPassOn, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        options = options || {};
                        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dao.find(search, options, transaction)];
                    case 2:
                        result = _a.sent();
                        if (Utils.isNullOrEmpty(result))
                            return [2 /*return*/, result];
                        foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
                        });
                        foreignKeys = _.filter(foreignKeys, function (key) {
                            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
                        });
                        results = _.map(foreignKeys, function (key) {
                            return __awaiter(this, void 0, void 0, function () {
                                var delegate;
                                return __generator(this, function (_a) {
                                    self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                                    delegate = key.referenced_table.DELEGATE;
                                    return [2 /*return*/, delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)), null, foreignKeysToPassOn)];
                                });
                            });
                        });
                        _.each(results, function (resultSet, index) {
                            result.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        self.logger.error('Error occurred while finding %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error_1.message);
                        throw error_1;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    /*
     * Perform search based on search query
     * Also fetch joint fields
     */
    BaseDaoDelegate.prototype.search = function (search, options, foreignKeys, transaction) {
        if (options === void 0) { options = {}; }
        if (foreignKeys === void 0) { foreignKeys = []; }
        return __awaiter(this, void 0, void 0, function () {
            var self, baseSearchResults, foreignKeysToPassOn, foreignKeyResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        options = options || {};
                        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
                        return [4 /*yield*/, this.dao.search(search, options, transaction)];
                    case 1:
                        baseSearchResults = _a.sent();
                        if (Utils.isNullOrEmpty(baseSearchResults))
                            return [2 /*return*/, baseSearchResults];
                        foreignKeysToPassOn = _.filter(foreignKeys, function (key) {
                            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
                        });
                        foreignKeys = _.filter(foreignKeys, function (key) {
                            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
                        });
                        foreignKeyResults = _.compact(_.map(foreignKeys, function (key) {
                            return __awaiter(this, void 0, void 0, function () {
                                var delegate;
                                return __generator(this, function (_a) {
                                    self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
                                    delegate = key.referenced_table.DELEGATE;
                                    return [2 /*return*/, delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))), null, foreignKeysToPassOn)];
                                });
                            });
                        }));
                        _.each(baseSearchResults, function (baseSearchResult) {
                            _.each(foreignKeyResults, function (resultSet, index) {
                                baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                            });
                        });
                        return [2 /*return*/, baseSearchResults];
                }
            });
        });
    };
    BaseDaoDelegate.prototype.searchWithIncludes = function (search, options, includes, transaction) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var self, baseSearchResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        options = options || {};
                        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;
                        return [4 /*yield*/, this.dao.search(search, options, transaction)];
                    case 1:
                        baseSearchResults = _a.sent();
                        if (Utils.isNullOrEmpty(baseSearchResults))
                            return [2 /*return*/, baseSearchResults];
                        return [2 /*return*/, self.processIncludes(baseSearchResults, search, options, includes, transaction)];
                }
            });
        });
    };
    BaseDaoDelegate.prototype.processIncludes = function (baseSearchResults, search, options, includes, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, foreignKeys, results;
            return __generator(this, function (_a) {
                self = this;
                foreignKeys = [];
                try {
                    results = _.map(includes, function (include) {
                        return __awaiter(this, void 0, void 0, function () {
                            var tempForeignKey, delegate, tempForeignKey, delegate;
                            return __generator(this, function (_a) {
                                if (typeof include === 'string') {
                                    tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(include);
                                    if (!Utils.isNullOrEmpty(tempForeignKey)) {
                                        foreignKeys.push(tempForeignKey);
                                        self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                                        delegate = tempForeignKey.referenced_table.DELEGATE;
                                        return [2 /*return*/, delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, null, transaction)];
                                    }
                                }
                                else {
                                    tempForeignKey = self.dao.modelClass.getForeignKeyForColumn(_.keys(include)[0]);
                                    if (!Utils.isNullOrEmpty(tempForeignKey)) {
                                        foreignKeys.push(tempForeignKey);
                                        self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                                        delegate = tempForeignKey.referenced_table.DELEGATE;
                                        return [2 /*return*/, delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, _.values(include)[0], transaction)];
                                    }
                                }
                                return [2 /*return*/];
                            });
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
                return [2 /*return*/, baseSearchResults];
            });
        });
    };
    BaseDaoDelegate.prototype.create = function (object, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            function prepareData(data) {
                var generatedId = new GlobalIdDelegate().generate(self.dao.modelClass.TABLE_NAME);
                data[BaseModel.COL_ID] = generatedId;
                data[BaseModel.COL_CREATED] = new Date();
                data[BaseModel.COL_UPDATED] = new Date();
                return data;
            }
            var self, newObject;
            return __generator(this, function (_a) {
                if (Utils.isNullOrEmpty(object))
                    throw new Error('Invalid data. Trying to create object with null data');
                self = this;
                ;
                newObject = (Utils.getObjectType(object) === 'Array') ? _.map(object, prepareData) : prepareData(object);
                return [2 /*return*/, this.dao.create(newObject, transaction)];
            });
        });
    };
    BaseDaoDelegate.prototype.update = function (criteria, newValues, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Compose update statement based on newValues
                newValues[BaseModel.COL_UPDATED] = new Date();
                delete newValues[BaseModel.COL_CREATED];
                delete newValues[BaseModel.COL_ID];
                return [2 /*return*/, this.dao.update(criteria, newValues, transaction)];
            });
        });
    };
    BaseDaoDelegate.prototype.delete = function (criteria, softDelete, transaction) {
        if (softDelete === void 0) { softDelete = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (Utils.isNullOrEmpty(criteria))
                    throw new Error('Please specify what to delete');
                if (softDelete)
                    return [2 /*return*/, this.dao.update(criteria, { 'deleted': new Date() }, transaction)];
                else
                    return [2 /*return*/, this.dao.delete(criteria, transaction)];
                return [2 /*return*/];
            });
        });
    };
    BaseDaoDelegate.prototype.save = function (object, dbTransaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction)];
            });
        });
    };
    return BaseDaoDelegate;
}());
module.exports = BaseDaoDelegate;
//# sourceMappingURL=BaseDaoDelegate.js.map