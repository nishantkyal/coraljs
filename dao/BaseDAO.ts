///<reference path='../_references.d.ts'/>
///<reference path='./IDao.ts'/>
///<reference path='../delegates/MysqlDelegate.ts'/>
///<reference path='../delegates/GlobalIDDelegate.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../common/Utils.ts'/>

/**
 Base class for DAO
 **/
module dao
{
    export class BaseDao
    {
        modelClass;
        tableName:string;
        logger:log4js_module.Logger = log4js.getLogger(common.Utils.getClassName(this));

        constructor()
        {
            this.modelClass = this.getModel();

            if (this.getModel() && this.getModel().TABLE_NAME)
                this.tableName = this.getModel().TABLE_NAME;
            else
                throw ('Invalid Model class specified for ' + common.Utils.getClassName(this));
        }

        create(data:any, transaction?:any):Q.IPromise<any>
        {
            var that = this;

            data = data || {};
            var id:number = data['id'];

            // Remove inserts with undefined values
            _.each(data, function (value, key) { if (value == undefined) delete data[key]; });

            var inserts:string[] = _.keys(data);
            var values:any[] = _.map(_.values(data), common.Utils.surroundWithQuotes);

            var query = 'INSERT INTO `' + this.tableName + '` (' + inserts.join(',') + ') VALUES (' + values.join(',') + ')';

            return delegates.MysqlDelegate.executeQuery(query, null, transaction)
                .then(
                function created()
                {
                    return (!transaction) ? that.get(id): new that.modelClass({'id': id});
                },
                function createFailure(error)
                {
                    that.logger.error('Error while creating a new %s, error: %s', that.tableName, error.message);
                    throw(error);
                });
        }

        get(id:any, fields?:string[]):Q.IPromise<any>
        {
            var that = this;
            var selectColumns = fields && fields.length != 0 ? fields.join(',') : '*';
            var query = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` WHERE id = ?';

            return delegates.MysqlDelegate.executeQuery(query, [id])
                .then(
                function objectFetched(rows:Object[])
                {
                    switch (rows.length)
                    {
                        case 0:
                            var errorMessage:string = 'No ' + that.tableName.replace('_', ' ') + ' found for id: ' + id;
                            that.logger.debug('No %s found for id: %s', that.tableName, id);
                            throw(errorMessage);
                            break;
                        case 1:
                            return new that.modelClass(rows[0]);
                            break;
                    }
                    return null;
                },
                function objectFetchError(error)
                {
                    that.logger.error('Error while fetching %s, id: %s', that.tableName, id);
                    throw(error);
                });
        }

        search(searchQuery:Object, options?:Object):Q.IPromise<any>
        {
            var that = this, values = [], whereStatements = [], selectColumns;

            for (var key in searchQuery)
            {
                var query = searchQuery[key];

                switch (common.Utils.getObjectType(query))
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
                        values.push(_.map(_.values(query), common.Utils.surroundWithQuotes));
                        break;
                    case 'Number':
                    case 'String':
                        whereStatements.push(key + ' = ' + common.Utils.surroundWithQuotes(query));
                        break;
                }
            }
            if (whereStatements.length == 0)
                throw ('Invalid search criteria');

            selectColumns = options && options.hasOwnProperty('fields') ? options['fields'].join(',') : '*';

            var queryString = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE ' + whereStatements.join(' AND ');

            return delegates.MysqlDelegate.executeQuery(queryString, values)
                .then(
                    function handleSearchResults(results:Array<Object>) { return _.map(results, function(result) { return new that.modelClass(result); }); }
                );
        }

        update(criteria:Object, newValues:Object, transaction?:any):Q.IPromise<any>
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
            return delegates.MysqlDelegate.executeQuery(query, values, transaction);
        }

        delete(id:string, softDelete:boolean = true, transaction?:any):Q.IPromise<any>
        {
            if (softDelete)
                return this.update({'id': id}, {'deleted': true}, transaction);

            return delegates.MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE id = ?', [id], transaction);
        }

        getModel():typeof models.BaseModel { throw('Model class not defined for ' + common.Utils.getClassName(this)); }

    }
}
