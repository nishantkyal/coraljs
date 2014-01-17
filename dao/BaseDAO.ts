import q                    = require('q');
import _                    = require('underscore');
import log4js               = require('log4js');
import IDao                 = require('./IDao');
import MysqlDelegate        = require('../delegates/MysqlDelegate')
import GlobalIdDelegate     = require('../delegates/GlobalIDDelegate');
import BaseModel            = require('../models/BaseModel');
import Utils                = require('../Utils');

/**
 Base class for DAO
 **/
class BaseDAO implements IDao
{

    tableName:string;
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor()
    {
        if (this.getModel() && this.getModel().TABLE_NAME)
            this.tableName = this.getModel().TABLE_NAME;
        else
            throw ('Invalid Model class specified for ' + Utils.getClassName(this));
    }

    /* Create */
    create(data:Object, transaction?:any):q.makePromise
    {
        var that:BaseDAO = this;

        data = data || {};

        // Compose insert statement based on data
        var generatedId:number = new GlobalIdDelegate().generate(this.tableName);
        data['id'] = generatedId;
        data['created'] = new Date().getTime();
        data['updated'] = new Date().getTime();

        // Remove inserts with undefined values
        _.each(data, function (value, key)
        {
            if (value == undefined)
                delete data[key];
        });

        var inserts:string[] = _.keys(data);
        var values:any[] = _.map(_.values(data), function addQuotesIfString(val)
        {
            if (val == undefined)
                return 'null';
            return typeof val === 'string' ? "'" + val + "'" : val;
        });

        var query = 'INSERT INTO ' + this.tableName + '(' + inserts.join(',') + ') VALUES (' + values.join(',') + ')';

        return MysqlDelegate.executeQuery(query, null, transaction)
            .then(
            function created(result)
            {
                // If happening in a transaction, just return generated id since record doesn't exist yet
                // Else fetch row
                if (!transaction)
                    return that.get(generatedId);
                else
                    return {'id': generatedId};
            },
            function createFailure(error)
            {
                that.logger.error('Error while creating a new ' + that.tableName + ', error: ' + error.message);
                throw(error);
            });

    }

    /* Get by id */
    get(id:any, fields?:string[]):q.makePromise
    {
        var that:BaseDAO = this;
        var selectColumns = fields ? fields.join(',') : '*';
        var query = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE id = ?';
        return MysqlDelegate.executeQuery(query, [id])
            .then(
            function objectFetched(rows:Object[])
            {
                switch (rows.length)
                {
                    case 0:
                        var errorMessage:string = 'No ' + that.tableName.replace('_', ' ') + ' found for id: ' + id;
                        that.logger.debug(errorMessage);
                        throw(errorMessage);
                        break;
                    case 1:
                        return rows[0];
                        break;
                }
                return null;
            },
            function objectFetchError(error)
            {
                that.logger.error('Error while fetching ' + that.tableName + ', id: ' + id);
                throw(error);
            });
    }

    /* Search */
    search(searchQuery:Object, options?:Object):q.makePromise
    {
        // Compose where statement based on searchQuery
        var values = [];
        var whereStatements = [];

        for (var key in searchQuery)
        {
            var query = searchQuery[key];

            if (_.isFunction(query))
                continue;
            else if (_.isArray(query))
            {
                whereStatements.push(key + ' IN (?)');
                values.push(_.map(_.values(query), function addQuotesIfString(val)
                {
                    val = val || '';
                    return typeof val === 'string' ? "'" + val + "'" : val;
                }));
            }
            else if (_.isObject(query))
            {
                var operator = query['operator'];
                var statement = key + ' ' + query['operator'] + ' ?';
                if (operator.toLowerCase() === 'between')
                    statement += ' AND ?';
                whereStatements.push(statement);
                values.push(query['value'][0]);
                values.push(query['value'][1]);
            }
            else if (_.isString(query))
            {
                whereStatements.push(key + ' = "' + query + '"');
            }
            else if (_.isNumber(query))
            {
                whereStatements.push(key + ' = ' + query);
            }
        }

        if (whereStatements.length == 0)
        {
            throw ('Invalid search criteria');
        }

        // Compose select statement based on fields
        var selectColumns = options && options.hasOwnProperty('fields') ? options['fields'].join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE ' + whereStatements.join(' AND ');
        return MysqlDelegate.executeQuery(queryString, values);
    }

    /* Update */
    update(criteria:Object, newValues:Object, transaction?:any):q.makePromise
    {
        // Remove fields with null values
        _.each(criteria, function (val, key)
        {
            if (val == null)
                delete criteria[key];
        });

        _.each(newValues, function (val, key)
        {
            if (val == null)
                delete newValues[key];
        });

        // Compose update statement based on newValues
        newValues['updated'] = new Date().getTime();
        delete newValues['id'];

        var updates = _.map(_.keys(newValues), function (updateColumn)
        {
            return updateColumn + ' = ?';
        });
        var values = _.values(newValues);

        // Compose criteria statements
        var wheres = _.map(_.keys(criteria), function (whereColumn)
        {
            return whereColumn + ' = ?';
        });
        values = values.concat(_.values(criteria));

        var query = 'UPDATE ' + this.tableName + ' SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
        return MysqlDelegate.executeQuery(query, values, transaction);
    }

    /* Delete */
    delete(id:string, softDelete:boolean = true, transaction?:any):q.makePromise
    {
        if (softDelete)
            return this.update({'id': id}, {'deleted': true}, transaction);
        else
            return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE id = ?', [id], transaction);
    }

    getModel():typeof BaseModel { throw('Model class not defined for ' + Utils.getClassName(this)); }

}
export = BaseDAO
