import mysql                                        = require('mysql');
import _                                            = require('underscore');
import log4js                                       = require('log4js');
import IDao                                         = require('../dao/IDao');
import MysqlDelegate                                = require('../delegates/MysqlDelegate')
import AbstractModel                                = require('../models/AbstractModel');
import Utils                                        = require('../common/Utils');
import IDaoFetchOptions                             = require('../dao/IDaoFetchOptions');

/*
 Base class for DAO
 */
class MysqlDao implements IDao {
    public modelClass: typeof AbstractModel;
    public tableName: string;
    public logger: log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    mysqlDelegate = new MysqlDelegate();

    constructor(modelClass: typeof AbstractModel) {
        this.modelClass = modelClass;

        // Instantiate model once so that foreign keys etc get computed
        new modelClass();

        if (this.modelClass && this.modelClass.TABLE_NAME)
            this.tableName = this.modelClass.TABLE_NAME;
        else
            throw new Error('Invalid Model class specified for ' + Utils.getClassName(this));
    }

    /**
     * Persist model
     * Can persist one or more at one time if all models have same data to be inserted
     * @param data
     * @param transaction
     */
    async create(data: Object[], transaction?: mysql.Connection): Promise<any>
    async create(data: Object, transaction?: mysql.Connection): Promise<any>
    async create(data: any, transaction?: mysql.Connection): Promise<any> {
        var self = this;
        var dataAsArray = [].concat(data);

        var insertedFields = [];
        var values = [];
        var rows = [];

        _.each(dataAsArray, function (row) {
            row = _.pick(row, self.modelClass['COLUMNS']);

            // 1. Remove fields with undefined values
            // 2. Check if it matches the existing list of fields being inserted
            // 3. If matches, create query string and values array
            _.each(row, function (value, key) {
                if (value == undefined || Utils.getObjectType(value) == 'Array' || Utils.getObjectType(value) == 'Object')
                    delete row[key];
            });

            var fieldsToInsert = _.map(_.keys(row), function(columnName) {
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
            await self.mysqlDelegate.executeQuery(query, values, transaction)
        } catch (error) {
            self.logger.error('Error while creating a new %s, error: %s', self.tableName, error.message);
            error.message = 'Error while creating a new ' + self.tableName + ', error: ' + error.message;
            switch (error.code) {
                case 'ER_DUP_ENTRY':
                    error.message = Utils.snakeToCamelCase(self.tableName) + ' already exists with those details';
            }
            throw(error);
        }

        return data;
    }

    /**
     * Get one or more rows by id
     * @param id
     * @param fields
     */
    async get(id: number[], options?: IDaoFetchOptions, transaction?: mysql.Connection): Promise<any>;
    async get(id: number, options?: IDaoFetchOptions, transaction?: mysql.Connection): Promise<any>;
    async get(id: any, options?: IDaoFetchOptions, transaction?: mysql.Connection): Promise<any> {
        var self = this;
        if (Utils.getObjectType(id) == 'Array' && id.length > 1)
            return this.search({id: id}, options, transaction);
        else {
            if (Utils.getObjectType(id) == 'Array')
                id = id[0];

            try {
                var result = await this.find({id: id}, options, transaction)
            } catch (error) {
                self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                throw(error);
            }

            if (Utils.isNullOrEmpty(result)) {
                var errorMessage: string = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                self.logger.debug('No %s found for id: %s', self.tableName, id);
                throw new Error(errorMessage);
            }
            else
                return result;
        }
    }

    /**
     * Search. Return all results
     * @param searchQuery
     * @param options
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any>}
     */
    async search(searchQuery?: Object, options: IDaoFetchOptions = {}, transaction?: mysql.Connection): Promise<any> {
        var self = this;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = whereStatements.where;
        var values = whereStatements.values;
        var selectColumns = !Utils.isNullOrEmpty(options.fields) ? options.fields.join(',') : '*';

        var whereStatementString;
        var deleteClause: string = ' (deleted IS NULL OR deleted = 0) ';

        if (wheres.length != 0 && !options.getDeleted)
            whereStatementString = 'WHERE ' + wheres.join(' AND ') + ' AND ' + deleteClause;
        else if (wheres.length != 0 && options.getDeleted)
            whereStatementString = 'WHERE ' + wheres.join(' AND ');
        else if (wheres.length == 0 && !options.getDeleted)
            whereStatementString = 'WHERE ' + deleteClause;
        else
            whereStatementString = ' ';

        // TODO: Validate max > offset etc
        // Pagination
        var limitClause: string = '';
        if (options.max && options.offset) {
            options.max = options.max || 18446744073709551610;
            limitClause = ' LIMIT ' + options.offset + ',' + options.max + ' ';
        }
        else if (options.max)
            limitClause = ' LIMIT ' + options.max + ' ';

        // TODO: Validate column names
        // Sort
        var sortClause = '';
        if (!Utils.isNullOrEmpty(options.sort))
            sortClause = ' ORDER BY ' + options.sort.join(",");

        var queryString = 'SELECT ' + selectColumns + ' ' +
            'FROM `' + this.tableName + '` '
            + whereStatementString + limitClause + sortClause;

        try {
            var results: any[] = await self.mysqlDelegate.executeQuery(queryString, values, transaction)
            var typecastedResults = _.map(results, function (result) {
                return new self.modelClass(result);
            });
        } catch (error) {
            self.logger.error('SEARCH failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
            throw(error);
        }

        return typecastedResults;
    }

    /**
     * Search. Return First result
     * @param searchQuery
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any|null>}
     */
    async find(searchQuery: Object, options?: IDaoFetchOptions, transaction?: mysql.Connection): Promise<any> {
        var self = this;
        options.max = 1;

        try {
            var result = await self.search(searchQuery, options, transaction)
        } catch (error) {
            self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
            throw(error);
        }

        if (result.length == 1)
            return result[0];
        else
            return result;
    }

    /**
     * Update based on criteria or id
     * @param criteria
     * @param newValues
     * @param transaction
     */
    async update(criteria: number, newValues: any, transaction?: mysql.Connection): Promise<any>;
    async update(criteria: Object, newValues: any, transaction?: mysql.Connection): Promise<any>;
    async update(criteria: any, newValues: any, transaction?: mysql.Connection): Promise<any> {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        newValues = _.pick(newValues, self.modelClass['COLUMNS']);

        // Remove fields with null values
        _.each(criteria, function (val, key) {
            if (val == undefined) delete criteria[key];
        });
        _.each(newValues, function (val, key) {
            if (val == undefined) delete newValues[key];
        });

        var updates = _.map(_.keys(newValues), function (updateColumn) {
            var fieldName = self.modelClass['COL_' + updateColumn.toUpperCase()];
            return updateColumn + ' = ?';
        });
        var values = _.values(newValues);

        // Compose criteria statements
        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements.where;
        values = values.concat(whereStatements.values);

        var query = 'UPDATE `' + this.tableName + '` SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");

        try {
            var result: any = await self.mysqlDelegate.executeQuery(query, values, transaction);
            if (result.affectedRows == 0)
                self.logger.info('Update did not change any rows in table - %s, for criteria - %s and values - %s', self.tableName, wheres.join(' AND'), values.join(','));
        } catch (error) {
            self.logger.error('UPDATE failed, error: %s, table: %s', error.message, self.tableName);
            throw(error);
        }
        return result;
    }

    /**
     * Delete by criteria or id
     * @param criteria
     * @param transaction
     */
    async delete(criteria: number, transaction?: mysql.Connection): Promise<any>;
    async delete(criteria: Object, transaction?: mysql.Connection): Promise<any>;
    async delete(criteria: any, transaction?: mysql.Connection): Promise<any> {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements.where;
        var values = whereStatements.values;

        var query = 'DELETE FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ');

        try {
            return await self.mysqlDelegate.executeQuery(query, values, transaction)
        } catch (error) {
            self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(criteria), error.message);
            throw(error);
        }
    }

    /** Helper method to convert query objects to SQL fragments **/
    public generateWhereStatements(criteria: Object = {}): { where: string[]; values: any[] } {
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

        return {where: whereStatements, values: values};
    }
}

export = MysqlDao
