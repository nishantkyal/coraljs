///<reference path='../_references.d.ts'/>
import mysql                                        = require('mysql');
import q                                            = require('q');
import _                                            = require('underscore');
import log4js                                       = require('log4js');
import MysqlDelegate                                = require('../delegates/MysqlDelegate')
import GlobalIdDelegate                             = require('../delegates/GlobalIDDelegate');
import BaseModel                                    = require('../models/BaseModel');
import AbstractModel                                = require('../models/AbstractModel');
import Utils                                        = require('../common/Utils');

/*
 Base class for DAO
 */
class AbstractDao
{
    public modelClass;
    public tableName:string;
    public logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(modelClass:typeof AbstractModel)
    {
        this.modelClass = modelClass;

        if (this.modelClass && this.modelClass.TABLE_NAME)
            this.tableName = this.modelClass.TABLE_NAME;
        else
            throw ('Invalid Model class specified for ' + Utils.getClassName(this));
    }

    /**
     * Persist model
     * Can persist one or more at one time if all models have same data to be inserted
     * @param data
     * @param transaction
     */
    create(data:Object[], transaction?:Object):q.Promise<any>;
    create(data:Object, transaction?:Object):q.Promise<any>;
    create(data:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var dataAsArray = [].concat(data);

        var insertedFields = [];
        var values = [];
        var rows = [];

        _.each(dataAsArray, function(row)
        {
            // 1. Remove fields with undefined values
            // 2. Check if it matches the existing list of fields being inserted
            // 3. If matches, create query string and values array
            _.each(row, function(value, key) {
                if (value == undefined || Utils.getObjectType(value) == 'Array' || Utils.getObjectType(value) == 'Object')
                    delete row[key];
            });

            var fieldsToInsert = _.keys(row);
            if (insertedFields.join(':') == fieldsToInsert.join(':') || insertedFields.length == 0)
            {
                values = values.concat(_.values(row));
                rows.push(row);
            }
            else
                throw('Inconsistent data. Not all values have same fields to be inserted');

            insertedFields = fieldsToInsert;
        });

        var query = 'INSERT INTO `' + self.tableName + '` (' + insertedFields.join(',') + ') VALUES ';
        query += Utils.repeatChar('(' + Utils.repeatChar('?', insertedFields.length, ',') + ')', rows.length, ',');

        return MysqlDelegate.executeQuery(query, values, transaction)
            .then(
            function created():any
            {
                // Since there were no errors we can just echo back the input as result (implying that these rows were created successfully)
                return data;
            },
            function createFailure(error)
            {
                self.logger.error('Error while creating a new %s, error: %s', self.tableName, error.message);
                error.message = 'Error while creating a new ' + self.tableName + ', error: ' + error.message;
                switch(error.code)
                {
                    case 'ER_DUP_ENTRY':
                        error.message = Utils.snakeToCamelCase(self.tableName) + ' already exists with those details';
                }
                throw(error);
            });
    }

    /**
     * Get one or more rows by id
     * @param id
     * @param fields
     */
    get(id:number[], fields?:string[], transaction?:Object):q.Promise<any>;
    get(id:number, fields?:string[], transaction?:Object):q.Promise<any>;
    get(id:any, fields?:string[], transaction?:Object):q.Promise<any>
    {
        var self = this;
        if (Utils.getObjectType(id) == 'Array')
            return this.search({id: id}, fields, transaction);
        else
            return this.find({id: id}, fields,transaction)
            .then(
            function objectFetched(result:any)
            {
                if (Utils.isNullOrEmpty(result))
                {
                    var errorMessage:string = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                    self.logger.debug('No %s found for id: %s', self.tableName, id);
                    throw(errorMessage);
                }
                else
                    return result;
            },
            function objectFetchError(error)
            {
                self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                throw(error);
            });
    }

    /**
     * Search. Return all results
     * @param searchQuery
     * @param options
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any>}
     */
    search(searchQuery:Object, fields?:string[], transaction?:Object):q.Promise<any>
    {
        var self = this;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = whereStatements.where;
        var values = whereStatements.values;
        var selectColumns = !Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ') + ' AND (deleted IS NULL OR deleted = 0)';

        return MysqlDelegate.executeQuery(queryString, values, transaction)
            .then(
            function handleSearchResults(results:any[]):any
            {
                return _.map(results, function (result) { return new self.modelClass(result); });
            },
            function searchError(error)
            {
                self.logger.error('SEARCH failed for table: %s, criteria: %s, error: %s', self.tableName, searchQuery, JSON.stringify(error));
                throw(error);
            });
    }

    /**
     * Search. Return First result
     * @param searchQuery
     * @param fields
     * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any|null>}
     */
    find(searchQuery:Object, fields?:string[], transaction?:Object):q.Promise<any>
    {
        var self = this;
        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = whereStatements.where;
        var values = whereStatements.values;
        var selectColumns:string = !Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ') + ' AND (deleted IS NULL OR deleted = 0)' + ' LIMIT 1';

        return MysqlDelegate.executeQuery(queryString, values, transaction)
            .then(
            function handleSearchResults(result) {
                if (result.length == 1)
                    return new self.modelClass(result[0]);
                else
                    return null;
            },
            function findError(error)
            {
                self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), JSON.stringify(error));
                throw(error);
            }
        );
    }

    /**
     * Update based on criteria or id
     * @param criteria
     * @param newValues
     * @param transaction
     */
    update(criteria:number, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:Object, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        // Remove fields with null values
        _.each(criteria, function (val, key) { if (val == undefined) delete criteria[key]; });
        _.each(newValues, function (val, key) { if (val == undefined) delete newValues[key]; });

        var updates = _.map(_.keys(newValues), function (updateColumn) { return updateColumn + ' = ?'; });
        var values = _.values(newValues);

        // Compose criteria statements
        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements.where;
        values = values.concat(whereStatements.values);

        var query = 'UPDATE `' + this.tableName + '` SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");

        return MysqlDelegate.executeQuery(query, values, transaction)
            .then(
            function updateComplete(result:mysql.OkPacket):any
            {
                if (result.affectedRows == 0)
                {
                    self.logger.debug('Update did not change any rows in table - %s, for criteria - %s and values - %s', self.tableName, wheres.join(' AND') , values.join(','));
                    throw('No rows were updated');
                }
                else
                    return result;
            },
            function updateError(error)
            {
                self.logger.error('UPDATE failed, error: %s', JSON.stringify(error));
                throw(error);
            });
    }

    /**
     * Delete by criteria or id
     * @param criteria
     * @param transaction
     */
    delete(criteria:number, transaction?:Object):q.Promise<any>;
    delete(criteria:Object, transaction?:Object):q.Promise<any>;
    delete(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements.where;
        var values = whereStatements.values;

        var query = 'DELETE FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ');

        return MysqlDelegate.executeQuery(query, values, transaction)
            .fail(
            function deleteFailed(error)
            {
                self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, criteria, JSON.stringify(error));
                throw(error);
            });
    }

    /** Helper method to convert query objects to SQL fragments **/
    public generateWhereStatements(criteria:Object):{where: string[]; values: any[]}
    {
        var whereStatements = [], values = [];
        for (var key in criteria)
        {
            var query = criteria[key];

            switch (Utils.getObjectType(query))
            {
                case 'Function':
                    continue;
                    break;
                case 'Object':
                    var operator = query['operator'];
                    var statement;

                    if (operator && operator.toLowerCase() === 'between')
                    {
                        statement = key + ' ' + operator + ' ? AND ?';
                        values.push(query['value'][0]);
                        values.push(query['value'][1]);
                    }
                    else if (query['value'])
                    {
                        statement = key + ' ' + operator + ' ?';
                        values.push(query['value']);
                    }
                    else if (query['raw'])
                    {
                        statement = key + ' ' + query['raw'];
                    }

                    whereStatements.push(statement);
                    break;
                case 'Array':
                    whereStatements.push(key + ' IN (?) ');
                    values.push(query);
                    break;
                case 'Number':
                case 'String':
                    whereStatements.push(key + ' = ?');
                    values.push(query)
                    break;
            }
        }

        return {where: whereStatements, values: values};
    }
}
export = AbstractDao
