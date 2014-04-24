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
    modelClass;
    private tableName:string;
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(modelClass:typeof AbstractModel)
    {
        this.modelClass = modelClass;

        if (this.modelClass && this.modelClass.TABLE_NAME)
            this.tableName = this.modelClass.TABLE_NAME;
        else
            throw ('Invalid Model class specified for ' + Utils.getClassName(this));
    }

    create(data:BaseModel, transaction?:any):q.Promise<any>
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
                // Since there were no errors we can just echo back the input as result (implied that these rows were created successfully)
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

    get(id:number[], fields?:string[]):q.Promise<any>;
    get(id:number, fields?:string[]):q.Promise<any>;
    get(id:any, fields?:string[]):q.Promise<any>
    {
        var self = this;
        if (Utils.getObjectType(id) == 'Array')
            return this.search({id: id}, fields);
        else
            return this.find({id: id}, fields)
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
                self.logger.error('Error while fetching %s, id: %s', self.tableName, id);
                throw(error);
            });
    }

    search(searchQuery:Object, options?:Object, fields?:string[]):q.Promise<any>
    {
        var self = this;
        var whereStatements:any[] = this.generateWhereStatements(searchQuery);
        var wheres:string[] = whereStatements['where'];
        var values:any[] = whereStatements['values'];
        var selectColumns = !Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ');

        return MysqlDelegate.executeQuery(queryString, values)
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

    find(searchQuery:Object, fields?:string[]):q.Promise<any>
    {
        var self = this;
        var whereStatements:string[] = this.generateWhereStatements(searchQuery);
        var wheres:string[] = whereStatements['where'];
        var values:any[] = whereStatements['values'];
        var selectColumns:string = !Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND ') + ' LIMIT 1';

        return MysqlDelegate.executeQuery(queryString, values)
            .then(
            function handleSearchResults(result) {
                if (result.length == 1)
                    return new self.modelClass(result[0]);
                else
                    return null;
            },
            function findError(error)
            {
                self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, searchQuery, JSON.stringify(error));
                throw(error);
            }
        );
    }

    update(criteria:number, newValues:Object, transaction?:any):q.Promise<any>;
    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
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
        var whereStatements:any[] = this.generateWhereStatements(criteria);
        var wheres:any = whereStatements['where'];
        values = values.concat(whereStatements['values']);

        var query = 'UPDATE `' + this.tableName + '` SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
            return MysqlDelegate.executeQuery(query, values, transaction)
            .then(
            function updateComplete(result:mysql.OkPacket):any
            {
                if (result.affectedRows == 0)
                    throw('No rows were updated');
                else
                    return result;
            },
            function updateError(error)
            {
                self.logger.error('UPDATE failed, error: %s', JSON.stringify(error));
                throw(error);
            }
        );
    }

    delete(criteria:number, transaction?:any):q.Promise<any>;
    delete(criteria:Object, transaction?:any):q.Promise<any>;
    delete(criteria:any, transaction?:any):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements['where'];
        var values = whereStatements['values'];

        return MysqlDelegate.executeQuery('DELETE FROM `' + this.tableName + '` WHERE ' + wheres.join(' AND '), values, transaction)
            .fail(
            function deleteFailed(error)
            {
                self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, criteria, JSON.stringify(error));
                throw(error);
            });
    }

    private generateWhereStatements(criteria:Object):any
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
                    var statement = key + ' ' + query['operator'] + ' ?';

                    if (operator.toLowerCase() === 'between')
                    {
                        statement += ' AND ?';
                        values.push(query['value'][0]);
                        values.push(query['value'][1]);
                    }
                    else
                        values.push(query['value']);

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

interface FetchOptions {
    includeDeleted?:boolean
}
export = AbstractDao
