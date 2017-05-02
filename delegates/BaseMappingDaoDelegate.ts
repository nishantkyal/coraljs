///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import log4js                                           = require('log4js');
import q                                                = require('q');
import moment                                           = require('moment');
import IDaoFetchOptions                                 = require('../dao/IDaoFetchOptions');
import MysqlDao                                         = require('../dao/MysqlDao');
import Utils                                            = require('../common/Utils');
import BaseModel                                        = require('../models/BaseModel');
import ForeignKey                                       = require('../models/ForeignKey');
import GlobalIdDelegate                                 = require('../delegates/GlobalIDDelegate');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');

class BaseMappingDaoDelegate
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    dao:MysqlDao;

    /** Can be constructed using just the model in case dao doesn't do anything special
     * e.g. Execute custom queries which MysqlDao doesn't support
     * @param dao
     */
    constructor(dao:typeof BaseModel);
    constructor(dao:MysqlDao);
    constructor(dao:any)
    {
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }

    get(id:any, options?:IDaoFetchOptions, foreignKeys:ForeignKey[] = [], transaction?:Object):q.Promise<any>
    {
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        id = [].concat(id);

        if (id.length > 1)
            return this.search({'id': id}, options, foreignKeys);

        if (id.length === 1)
            return this.find({'id': id}, options, foreignKeys);
    }

    find(search:Object, options?:IDaoFetchOptions, foreignKeys:ForeignKey[] = [], transaction?:Object):q.Promise<any>
    {
        var self:BaseMappingDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        return this.dao.find(search, options, transaction)
            .then(
            function processForeignKeys(result:BaseModel):any
            {
                if (Utils.isNullOrEmpty(result))
                    return result;

                var foreignKeyTasks = _.map(foreignKeys, function (key:ForeignKey)
                {
                    self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                    var delegate = key.referenced_table.DELEGATE;
                    return delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)));
                });
                return [result, q.all(foreignKeyTasks)];
            })
            .spread(
            function handleIncludesProcessed(result, ...args)
            {
                var results = args[0];

                _.each(results, function (resultSet:any, index)
                {
                    result.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                });
                return result;
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('Error occurred while finding %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
                throw error;
            });
    }

    /*
     * Perform search based on search query
     * Also fetch joint fields
     */
    search(search:Object, options?:IDaoFetchOptions, foreignKeys:ForeignKey[] = [], transaction?:Object):q.Promise<any>
    {
        var self:BaseMappingDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        return this.dao.search(search, options, transaction)
            .then(
            function processIncludes(baseSearchResults:BaseModel[]):any
            {
                if (Utils.isNullOrEmpty(baseSearchResults))
                    return baseSearchResults;

                var foreignKeyTasks = _.map(foreignKeys, function (key:ForeignKey)
                {

                    self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
                    var delegate = key.referenced_table.DELEGATE;
                    return delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))));
                });
                return [baseSearchResults, q.all(foreignKeyTasks)];
            })
            .spread(
            function handleIncludesProcessed(baseSearchResults, ...args)
            {
                var results = args[0];

                _.each(baseSearchResults, function (baseSearchResult:any)
                {
                    _.each(results, function (resultSet:any, index)
                    {
                        baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                    })
                });
                return baseSearchResults;
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
                throw error;
            });
    }

    searchWithIncludes(search?:Object, options:IDaoFetchOptions = {}, includes?:Object[], transaction?:Object):q.Promise<any>
    {
        var self:BaseMappingDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        return this.dao.search(search, options, transaction)
            .then(function searchComplete(baseSearchResults:BaseModel[])
            {
                return self.processIncludes(baseSearchResults, search, options, includes, transaction);
            });
    }

    processIncludes(baseSearchResults:BaseModel[], search?:Object, options?:IDaoFetchOptions, includes?:Object[], transaction?:Object):any
    {
        if (Utils.isNullOrEmpty(baseSearchResults))
            return baseSearchResults;

        var self:BaseMappingDaoDelegate = this;
        var foreignKeyTasks = [];
        var foreignKeys:ForeignKey[] = [];

        _.each(includes, function (include:any)
        {
            if (typeof include === 'string') //if no nested includes
            {
                var tempForeignKey:ForeignKey = self.dao.modelClass.getForeignKeyForColumn(include);
                if (!Utils.isNullOrEmpty(tempForeignKey))
                {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    foreignKeyTasks.push(delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, null, transaction));
                }
            }
            else // if nested includes then pass on to next call
            {
                var tempForeignKey:ForeignKey = self.dao.modelClass.getForeignKeyForColumn(_.keys(include)[0]);
                if (!Utils.isNullOrEmpty(tempForeignKey))
                {
                    foreignKeys.push(tempForeignKey);
                    self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                    var delegate = tempForeignKey.referenced_table.DELEGATE;
                    foreignKeyTasks.push(delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, _.values(include)[0]), transaction);
                }
            }
        });

        return q.all(foreignKeyTasks)
            .then(
            function handleIncludesProcessed(...args)
            {
                var results:any = args[0];

                _.each(baseSearchResults, function (baseSearchResult:any)
                {
                    _.each(results, function (resultSet:any, index)
                    {
                        baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                    })
                });
                return baseSearchResults;
            })
            .fail(
            function handleFailure(error:Error)
            {
                self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
                throw error;
            });
    }

    create(mappingObject:Object, object:Object, transaction?:Object):q.Promise<any>;
    create(mappingObject:Object, object:any, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var tempObject = _.clone(object);

        if (Utils.isNullOrEmpty(object))
            throw new Error('Invalid data. Trying to create object with null data');

        var fk:ForeignKey = this.dao.modelClass['FOREIGN_KEYS'][0];

        return fk.referenced_table.DELEGATE.create(object)
            .then(
            function created(item)
            {
                mappingObject[fk.getSourcePropertyName() + '_id'] = item.id;
                return self.dao.create(mappingObject, transaction);
            })
            .fail(
            function createFailed()
            {
                return fk.referenced_table.DELEGATE.find(tempObject)
                    .then(
                    function fetched(item)
                    {
                        mappingObject[fk.getSourcePropertyName() + '_id'] = item.id;
                        return self.dao.create(mappingObject, transaction);
                    });
            });
    }

    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        return this.dao.update(criteria, newValues, transaction);
    }

    delete(criteria:number, softDelete?:boolean, transaction?:Object):q.Promise<any>;
    delete(criteria:Object, softDelete?:boolean, transaction?:Object):q.Promise<any>;
    delete(criteria:any, softDelete:boolean = true, transaction?:Object):q.Promise<any>
    {
        return this.dao.delete(criteria, transaction);
    }

    save(object:Object, dbTransaction?:Object):q.Promise<any>
    {
        return Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction);
    }
}
export = BaseMappingDaoDelegate