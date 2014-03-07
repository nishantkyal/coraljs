import q                    = require('q');
import _                    = require('underscore');
import log4js               = require('log4js');
import IDao                 = require('./IDao');
import MysqlDelegate        = require('../delegates/MysqlDelegate')
import GlobalIdDelegate     = require('../delegates/GlobalIDDelegate');
import BaseModel            = require('../models/BaseModel');
import Utils                = require('../common/Utils');

/*
 Base class for DAO
 */
class BaseDao implements IDao
{
    modelClass;
    tableName:string;
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor()
    {
        this.modelClass = this.getModel();

        if (this.getModel() && this.getModel().TABLE_NAME)
            this.tableName = this.getModel().TABLE_NAME;
        else
            throw ('Invalid Model class specified for ' + Utils.getClassName(this));
    }

    create(data:any, transaction?:any):q.Promise<any>
    {
        var self = this;

        data = data || {};
        var id:number = data['id'];

        // Remove inserts with undefined values
        _.each(data, function (value, key)
        {
            if (value == undefined || Utils.getObjectType(value) == 'Array' || Utils.getObjectType(value) == 'Object')
                delete data[key];
        });

        var inserts:string[] = _.keys(data);
        var values:any[] = _.map(_.values(data), Utils.surroundWithQuotes);

        var query = 'INSERT INTO `' + this.tableName + '` (' + inserts.join(',') + ') VALUES (' + values.join(',') + ')';

        return MysqlDelegate.executeQuery(query, null, transaction)
            .then(
            function created()
            {
                return (!transaction) ? self.get(id) : new self.modelClass({'id': id});
            },
            function createFailure(error)
            {
                self.logger.error('Error while creating a new %s, error: %s', self.tableName, error.message);
                var message = 'Error while creating a new ' + self.tableName + ', error: ' + error.message;
                switch(error.code)
                {
                    case 'ER_DUP_ENTRY':
                        message = Utils.snakeToCamelCase(self.tableName) + ' already exists with those details';
                }
                throw(message);
            });
    }

    get(id:number, fields?:string[]):q.Promise<any>
    {
        var self = this;
        var selectColumns = fields && fields.length != 0 ? fields.join(',') : '*';
        var query = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE id = ?';

        return MysqlDelegate.executeQuery(query, [id])
            .then(
            function objectFetched(rows:Object[])
            {
                switch (rows.length)
                {
                    case 0:
                        var errorMessage:string = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                        self.logger.debug('No %s found for id: %s', self.tableName, id);
                        throw(errorMessage);
                        break;
                    case 1:
                        return new self.modelClass(rows[0]);
                        break;
                }
                return null;
            },
            function objectFetchError(error)
            {
                self.logger.error('Error while fetching %s, id: %s', self.tableName, id);
                throw(error);
            });
    }

    search(searchQuery:Object, options?:Object, fields?:string[]):q.Promise<any>
    {
        var self = this, values = [], whereStatements = [], selectColumns;

        var whereStatements:any[] = this.generateWhereStatements(searchQuery);
        var wheres:string[] = whereStatements['where'];
        var values:any[] = whereStatements['values'];

        selectColumns = Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE ' + wheres.join(' AND ');

        return MysqlDelegate.executeQuery(queryString, values)
            .then(
            function handleSearchResults(results:Array<any>) { return _.map(results, function (result) { return new self.modelClass(result); }); });
    }

    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        // Remove fields with null values
        _.each(criteria, function (val, key) { if (val == undefined) delete criteria[key]; });
        _.each(newValues, function (val, key) { if (val == undefined) delete newValues[key]; });

        var values = [], updates, wheres;

        updates = _.map(_.keys(newValues), function (updateColumn) { return updateColumn + ' = ?'; });
        values = values.concat(_.values(newValues));

        // Compose criteria statements
        var whereStatements:any[] = this.generateWhereStatements(criteria);
        var wheres:any = whereStatements['where'];
        values = values.concat(whereStatements['values']);

        var query = 'UPDATE ' + this.tableName + ' SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
        return MysqlDelegate.executeQuery(query, values, transaction);
    }

    delete(id:number, transaction?:any):q.Promise<any>
    {
        return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE id = ?', [id], transaction);
    }

    searchAndDelete(criteria:Object, transaction?:any):q.Promise<any>
    {
        var whereStatements = this.generateWhereStatements(criteria);
        var wheres = whereStatements['where'];
        var values = whereStatements['values'];

        return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE ' + wheres.join(' AND '), values, transaction);
    }

    getModel():typeof BaseModel { throw('Model class not defined for ' + Utils.getClassName(this)); }

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
                        statement += ' AND ?';
                    whereStatements.push(statement);
                    values.push(query['value'][0]);
                    values.push(query['value'][1]);
                    break;
                case 'Array':
                    whereStatements.push(key + ' IN (?)');
                    values.push(_.map(_.values(query), Utils.surroundWithQuotes));
                    break;
                case 'Number':
                case 'String':
                    whereStatements.push(key + ' = ' + Utils.surroundWithQuotes(query));
                    break;
            }
        }

        return {where: whereStatements, values: values};
    }
}
export = BaseDao