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
var MysqlDelegate = require("../delegates/MysqlDelegate");
var Utils = require("../common/Utils");
/*
 Base class for DAO
 */
var MysqlDao = (function () {
    function MysqlDao(modelClass) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.mysqlDelegate = new MysqlDelegate();
        this.modelClass = modelClass;
        // Instantiate model once so that foreign keys etc get computed
        new modelClass();
        if (this.modelClass && this.modelClass.TABLE_NAME)
            this.tableName = this.modelClass.TABLE_NAME;
        else
            throw new Error('Invalid Model class specified for ' + Utils.getClassName(this));
    }
    MysqlDao.prototype.create = function (data, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, dataAsArray, insertedFields, values, rows, query, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        dataAsArray = [].concat(data);
                        insertedFields = [];
                        values = [];
                        rows = [];
                        _.each(dataAsArray, function (row) {
                            row = _.pick(row, self.modelClass['COLUMNS']);
                            // 1. Remove fields with undefined values
                            // 2. Check if it matches the existing list of fields being inserted
                            // 3. If matches, create query string and values array
                            _.each(row, function (value, key) {
                                if (value == undefined || Utils.getObjectType(value) == 'Array' || Utils.getObjectType(value) == 'Object')
                                    delete row[key];
                            });
                            var fieldsToInsert = _.map(_.keys(row), function (columnName) {
                                return self.modelClass['COL_' + columnName.toUpperCase()];
                            });
                            if (insertedFields.join(':') == fieldsToInsert.join(':') || insertedFields.length == 0) {
                                values = values.concat(_.values(row));
                                rows.push(row);
                            }
                            else
                                throw new Error('Inconsistent data. Not all values have same fields to be inserted');
                            insertedFields = fieldsToInsert;
                        });
                        query = 'INSERT INTO `' + self.tableName + '` (' + insertedFields.join(',') + ') VALUES ';
                        query += Utils.repeatChar('(' + Utils.repeatChar('?', insertedFields.length, ',') + ')', rows.length, ',');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.mysqlDelegate.executeQuery(query, values, transaction)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        self.logger.error('Error while creating a new %s, error: %s', self.tableName, error_1.message);
                        error_1.message = 'Error while creating a new ' + self.tableName + ', error: ' + error_1.message;
                        switch (error_1.code) {
                            case 'ER_DUP_ENTRY':
                                error_1.message = Utils.snakeToCamelCase(self.tableName) + ' already exists with those details';
                        }
                        throw (error_1);
                    case 4: return [2 /*return*/, data];
                }
            });
        });
    };
    MysqlDao.prototype.get = function (id, options, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, result, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (!(Utils.getObjectType(id) == 'Array' && id.length > 1)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.search({ id: id }, options, transaction)];
                    case 1:
                        if (Utils.getObjectType(id) == 'Array')
                            id = id[0];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.find({ id: id }, options, transaction)];
                    case 3:
                        result = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                        throw (error_2);
                    case 5:
                        if (Utils.isNullOrEmpty(result)) {
                            errorMessage = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                            self.logger.debug('No %s found for id: %s', self.tableName, id);
                            throw new Error(errorMessage);
                        }
                        else
                            return [2 /*return*/, result];
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search. Return all results
     * @param searchQuery
     * @param options
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any>}
     */
    MysqlDao.prototype.search = function (searchQuery, options, transaction) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var self, whereStatements, wheres, values, selectColumns, whereStatementString, deleteClause, limitClause, sortClause, queryString, results, typecastedResults, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        whereStatements = this.generateWhereStatements(searchQuery);
                        wheres = whereStatements.where;
                        values = whereStatements.values;
                        selectColumns = !Utils.isNullOrEmpty(options.fields) ? options.fields.join(',') : '*';
                        deleteClause = ' (deleted IS NULL OR deleted = 0) ';
                        if (wheres.length != 0 && !options.getDeleted)
                            whereStatementString = 'WHERE ' + wheres.join(' AND ') + ' AND ' + deleteClause;
                        else if (wheres.length != 0 && options.getDeleted)
                            whereStatementString = 'WHERE ' + wheres.join(' AND ');
                        else if (wheres.length == 0 && !options.getDeleted)
                            whereStatementString = 'WHERE ' + deleteClause;
                        else
                            whereStatementString = ' ';
                        limitClause = '';
                        if (options.max && options.offset) {
                            options.max = options.max || 18446744073709551610;
                            limitClause = ' LIMIT ' + options.offset + ',' + options.max + ' ';
                        }
                        else if (options.max)
                            limitClause = ' LIMIT ' + options.max + ' ';
                        sortClause = '';
                        if (!Utils.isNullOrEmpty(options.sort))
                            sortClause = ' ORDER BY ' + options.sort.join(",");
                        queryString = 'SELECT ' + selectColumns + ' ' +
                            'FROM `' + this.tableName + '` '
                            + whereStatementString + sortClause + limitClause;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.mysqlDelegate.executeQuery(queryString, values, transaction)];
                    case 2:
                        results = _a.sent();
                        typecastedResults = _.map(results, function (result) {
                            return new self.modelClass(result);
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        self.logger.error('SEARCH failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error_3.message);
                        throw (error_3);
                    case 4: return [2 /*return*/, typecastedResults];
                }
            });
        });
    };
    /**
     * Search. Return First result
     * @param searchQuery
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any|null>}
     */
    MysqlDao.prototype.find = function (searchQuery, options, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        options.max = 1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.search(searchQuery, options, transaction)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error_4.message);
                        throw (error_4);
                    case 4:
                        if (result.length == 1)
                            return [2 /*return*/, result[0]];
                        else
                            return [2 /*return*/, result];
                        return [2 /*return*/];
                }
            });
        });
    };
    MysqlDao.prototype.update = function (criteria, newValues, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, updates, values, whereStatements, wheres, query, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (Utils.getObjectType(criteria) == 'Number')
                            criteria = { id: criteria };
                        newValues = _.pick(newValues, self.modelClass['COLUMNS']);
                        // Remove fields with null values
                        _.each(criteria, function (val, key) {
                            if (val == undefined)
                                delete criteria[key];
                        });
                        _.each(newValues, function (val, key) {
                            if (val == undefined)
                                delete newValues[key];
                        });
                        updates = _.map(_.keys(newValues), function (updateColumn) {
                            var fieldName = self.modelClass['COL_' + updateColumn.toUpperCase()];
                            return updateColumn + ' = ?';
                        });
                        values = _.values(newValues);
                        whereStatements = this.generateWhereStatements(criteria);
                        wheres = whereStatements.where;
                        values = values.concat(whereStatements.values);
                        query = 'UPDATE `' + this.tableName + '` SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.mysqlDelegate.executeQuery(query, values, transaction)];
                    case 2:
                        result = _a.sent();
                        if (result.affectedRows == 0)
                            self.logger.info('Update did not change any rows in table - %s, for criteria - %s and values - %s', self.tableName, wheres.join(' AND'), values.join(','));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        self.logger.error('UPDATE failed, error: %s, table: %s', error_5.message, self.tableName);
                        throw (error_5);
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    MysqlDao.prototype.delete = function (criteria, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var self, whereStatements, wheres, values, query, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (Utils.getObjectType(criteria) == 'Number')
                            criteria = { id: criteria };
                        whereStatements = this.generateWhereStatements(criteria);
                        wheres = whereStatements.where;
                        values = whereStatements.values;
                        query = 'DELETE FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.mysqlDelegate.executeQuery(query, values, transaction)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_6 = _a.sent();
                        self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(criteria), error_6.message);
                        throw (error_6);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** Helper method to convert query objects to SQL fragments **/
    MysqlDao.prototype.generateWhereStatements = function (criteria) {
        if (criteria === void 0) { criteria = {}; }
        var self = this;
        //criteria = _.pick(criteria, self.modelClass['COLUMNS']);
        var whereStatements = [], values = [];
        for (var key in criteria) {
            var query = criteria[key];
            switch (Utils.getObjectType(query)) {
                case 'Function':
                    break;
                case 'Object':
                    var operator = query['operator'];
                    var statement;
                    if (operator && operator.toLowerCase() === 'between') {
                        statement = key + ' ' + operator + ' ? AND ?';
                        values.push(query['value'][0]);
                        values.push(query['value'][1]);
                    }
                    else if (operator && operator.toLowerCase() === 'greaterthan') {
                        statement = key + ' > ?';
                        values.push(query['value']);
                    }
                    else if (operator && operator.toLowerCase() === 'lessthan') {
                        statement = key + ' < ?';
                        values.push(query['value']);
                    }
                    else if (operator && operator.toLowerCase() === 'or') {
                        statement = '(' + key + ' = ? ' + operator + ' ' + key + ' = ?) ';
                        values.push(query['value'][0]);
                        values.push(query['value'][1]);
                    }
                    else if (query['value']) {
                        statement = key + ' ' + operator + ' ?';
                        values.push(query['value']);
                    }
                    else if (query['raw']) {
                        statement = key + ' ' + query['raw'];
                    }
                    whereStatements.push(statement);
                    break;
                case 'Array':
                    if (query.length != 0) {
                        whereStatements.push(key + ' IN (?) ');
                        values.push(query);
                    }
                    break;
                case 'Number':
                case 'String':
                    whereStatements.push(key + ' = ?');
                    values.push(query);
                    break;
                case 'Boolean':
                    whereStatements.push(key + ' = ?');
                    values.push(query ? 1 : 0);
                    break;
            }
        }
        return { where: whereStatements, values: values };
    };
    return MysqlDao;
}());
module.exports = MysqlDao;
//# sourceMappingURL=MysqlDao.js.map