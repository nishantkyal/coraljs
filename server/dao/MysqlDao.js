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
const MysqlDelegate = require("../delegates/MysqlDelegate");
const Utils = require("../common/Utils");
class MysqlDao {
    constructor(modelClass) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.mysqlDelegate = new MysqlDelegate();
        this.modelClass = modelClass;
        new modelClass();
        if (this.modelClass && this.modelClass.TABLE_NAME)
            this.tableName = this.modelClass.TABLE_NAME;
        else
            throw new Error('Invalid Model class specified for ' + Utils.getClassName(this));
    }
    create(data, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var dataAsArray = [].concat(data);
            var insertedFields = [];
            var values = [];
            var rows = [];
            _.each(dataAsArray, function (row) {
                row = _.pick(row, self.modelClass['COLUMNS']);
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
            var query = 'INSERT INTO `' + self.tableName + '` (' + insertedFields.join(',') + ') VALUES ';
            query += Utils.repeatChar('(' + Utils.repeatChar('?', insertedFields.length, ',') + ')', rows.length, ',');
            try {
                yield self.mysqlDelegate.executeQuery(query, values, transaction);
            }
            catch (error) {
                self.logger.error('Error while creating a new %s, error: %s', self.tableName, error.message);
                error.message = 'Error while creating a new ' + self.tableName + ', error: ' + error.message;
                switch (error.code) {
                    case 'ER_DUP_ENTRY':
                        error.message = Utils.snakeToCamelCase(self.tableName) + ' already exists with those details';
                }
                throw (error);
            }
            return data;
        });
    }
    get(id, options, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (Utils.getObjectType(id) == 'Array' && id.length > 1)
                return this.search({ id: id }, options, transaction);
            else {
                if (Utils.getObjectType(id) == 'Array')
                    id = id[0];
                try {
                    var result = yield this.find({ id: id }, options, transaction);
                }
                catch (error) {
                    self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                    throw (error);
                }
                if (Utils.isNullOrEmpty(result)) {
                    var errorMessage = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                    self.logger.debug('No %s found for id: %s', self.tableName, id);
                    throw new Error(errorMessage);
                }
                else
                    return result;
            }
        });
    }
    search(searchQuery, options = {}, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var whereStatements = this.generateWhereStatements(searchQuery);
            var wheres = whereStatements.where;
            var values = whereStatements.values;
            var selectColumns = !Utils.isNullOrEmpty(options.fields) ? options.fields.join(',') : '*';
            var whereStatementString;
            var deleteClause = ' (deleted IS NULL OR deleted = 0) ';
            if (wheres.length != 0 && !options.getDeleted)
                whereStatementString = 'WHERE ' + wheres.join(' AND ') + ' AND ' + deleteClause;
            else if (wheres.length != 0 && options.getDeleted)
                whereStatementString = 'WHERE ' + wheres.join(' AND ');
            else if (wheres.length == 0 && !options.getDeleted)
                whereStatementString = 'WHERE ' + deleteClause;
            else
                whereStatementString = ' ';
            var limitClause = '';
            if (options.max && options.offset) {
                options.max = options.max || 18446744073709551610;
                limitClause = ' LIMIT ' + options.offset + ',' + options.max + ' ';
            }
            else if (options.max)
                limitClause = ' LIMIT ' + options.max + ' ';
            var sortClause = '';
            if (!Utils.isNullOrEmpty(options.sort))
                sortClause = ' ORDER BY ' + options.sort.join(",");
            var queryString = 'SELECT ' + selectColumns + ' ' +
                'FROM `' + this.tableName + '` '
                + whereStatementString + sortClause + limitClause;
            try {
                var results = yield self.mysqlDelegate.executeQuery(queryString, values, transaction);
                var typecastedResults = _.map(results, function (result) {
                    return new self.modelClass(result);
                });
            }
            catch (error) {
                self.logger.error('SEARCH failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                throw (error);
            }
            return typecastedResults;
        });
    }
    find(searchQuery, options, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            options.max = 1;
            try {
                var result = yield self.search(searchQuery, options, transaction);
            }
            catch (error) {
                self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                throw (error);
            }
            if (result.length == 1)
                return result[0];
            else
                return result;
        });
    }
    update(criteria, newValues, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (Utils.getObjectType(criteria) == 'Number')
                criteria = { id: criteria };
            newValues = _.pick(newValues, self.modelClass['COLUMNS']);
            _.each(criteria, function (val, key) {
                if (val == undefined)
                    delete criteria[key];
            });
            _.each(newValues, function (val, key) {
                if (val == undefined)
                    delete newValues[key];
            });
            var updates = _.map(_.keys(newValues), function (updateColumn) {
                var fieldName = self.modelClass['COL_' + updateColumn.toUpperCase()];
                return updateColumn + ' = ?';
            });
            var values = _.values(newValues);
            var whereStatements = this.generateWhereStatements(criteria);
            var wheres = whereStatements.where;
            values = values.concat(whereStatements.values);
            var query = 'UPDATE `' + this.tableName + '` SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
            try {
                var result = yield self.mysqlDelegate.executeQuery(query, values, transaction);
                if (result.affectedRows == 0)
                    self.logger.info('Update did not change any rows in table - %s, for criteria - %s and values - %s', self.tableName, wheres.join(' AND'), values.join(','));
            }
            catch (error) {
                self.logger.error('UPDATE failed, error: %s, table: %s', error.message, self.tableName);
                throw (error);
            }
            return result;
        });
    }
    delete(criteria, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (Utils.getObjectType(criteria) == 'Number')
                criteria = { id: criteria };
            var whereStatements = this.generateWhereStatements(criteria);
            var wheres = whereStatements.where;
            var values = whereStatements.values;
            var query = 'DELETE FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ');
            try {
                return yield self.mysqlDelegate.executeQuery(query, values, transaction);
            }
            catch (error) {
                self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(criteria), error.message);
                throw (error);
            }
        });
    }
    generateWhereStatements(criteria = {}) {
        var self = this;
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
    }
}
module.exports = MysqlDao;
//# sourceMappingURL=MysqlDao.js.map