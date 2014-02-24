import q                    = require('q');
import _                    = require('underscore');
import log4js               = require('log4js');
import IDao                 = require('./IDao');
import MysqlDelegate        = require('../delegates/MysqlDelegate')
import GlobalIdDelegate     = require('../delegates/GlobalIDDelegate');
import BaseModel            = require('../models/BaseModel');
import Utils                = require('../common/Utils');

/**
 Base class for DAO
 **/
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
        _.each(data, function (value, key) { if (value == undefined) delete data[key]; });

        var inserts:string[] = _.keys(data);
        var values:any[] = _.map(_.values(data), Utils.surroundWithQuotes);

        var query = 'INSERT INTO `' + this.tableName + '` (' + inserts.join(',') + ') VALUES (' + values.join(',') + ')';

        return MysqlDelegate.executeQuery(query, null, transaction)
            .then(
            function created()
            {
                return (!transaction) ? self.get(id): new self.modelClass({'id': id});
            },
            function createFailure(error)
            {
                self.logger.error('Error while creating a new %s, error: %s', self.tableName, error.message);
                throw(error);
            });

    }

    get(id:any, fields?:string[]):q.Promise<any>
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

    search(searchQuery:Object, options?:Object):q.Promise<any>
    {
        var self = this, values = [], whereStatements = [], selectColumns;

        for (var key in searchQuery)
        {
            var query = searchQuery[key];

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
        if (whereStatements.length == 0)
            throw ('Invalid search criteria');

        selectColumns = options && options.hasOwnProperty('fields') ? options['fields'].join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE ' + whereStatements.join(' AND ');

        return MysqlDelegate.executeQuery(queryString, values)
            .then(
                function handleSearchResults(results:Array<any>) { return _.map(results, function(result) { return new self.modelClass(result); }); }
            );
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>
    {
        // Remove fields with null values
        _.each(_.extend({}, criteria, newValues), function (val, key) { if (val == undefined) delete criteria[key]; });

        var values = [], updates, wheres;

        updates = _.map(_.keys(newValues), function (updateColumn) { return updateColumn + ' = ?'; });
        values = values.concat(_.values(newValues));

        // Compose criteria statements
        wheres = _.map(_.keys(criteria), function (whereColumn) { return whereColumn + ' = ?'; });
        values = values.concat(_.values(criteria));

        var query = 'UPDATE ' + this.tableName + ' SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
        return MysqlDelegate.executeQuery(query, values, transaction);
    }

    delete(id:string, softDelete:boolean = true, transaction?:any):q.Promise<any>
    {
        if (softDelete)
            return this.update({'id': id}, {'deleted': true}, transaction);

        return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE id = ?', [id], transaction);
    }

    searchAndDelete(id:string, softDelete:boolean = true, transaction?:any):q.Promise<any>
    {
        if (softDelete)
            return this.update({'schedule_rule_id': id}, {'deleted': true}, transaction);

        return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE schedule_rule_id = ?', [id], transaction);
    }

    getModel():typeof BaseModel { throw('Model class not defined for ' + Utils.getClassName(this)); }

}
export = BaseDao