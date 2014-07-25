///<reference path='../_references.d.ts'/>
import _                                = require('underscore');
import log4js                           = require('log4js');
import q                                = require('q');
import moment                           = require('moment');
import AbstractDao                      = require('../dao/AbstractDao');
import Utils                            = require('../common/Utils');
import BaseModel                        = require('../models/BaseModel');
import GlobalIdDelegate                 = require('../delegates/GlobalIDDelegate');
import IncludeFlag                      = require('../enums/IncludeFlag');

class BaseDaoDelegate
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    dao:AbstractDao;

    /** Can be constructed using just the model in case dao doesn't do anything special
     * e.g. Execute custom queries which AbstractDao doesn't support
     * @param dao
     */
    constructor(dao:typeof BaseModel);
    constructor(dao:AbstractDao);
    constructor(dao:any)
    {
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new AbstractDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }

    get(id:any, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        if (Utils.getObjectType(id) === 'Array' && id.length > 0)
            return this.search({'id': id}, fields, includes);

        if (Utils.getObjectType(id) === 'Array' && id.length === 1)
            id = id[0];


        var self = this;

        // 1. Get the queried object
        // 2. Parse flags and add handlers to a queue
        // 3. When queue is complete, concat all results to queried object and return
        return this.dao.get(id, fields, transaction)
            .then(
            function processIncludes(result):any
            {
                if (Utils.isNullOrEmpty(result))
                    return result;

                var includeTasks = _.map(includes, function (flag)
                {
                    return self.getIncludeHandler(flag, result);
                });
                return [result, q.all(includeTasks)];
            })
            .spread(
            function handleIncludesProcessed(result, ...args:any[]):any
            {
                self.logger.debug('Includes processed for %s', Utils.getClassName(self.dao.modelClass));
                var results = args[0];

                _.each(results, function(resultSet, index) {
                    result.set(includes[index], resultSet);
                });

                return result;
            });
    }

    find(search:Object, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var self:BaseDaoDelegate = this;

        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        return this.dao.find(search, fields, transaction)
            .then(
            function processIncludes(result)
            {
                if (Utils.isNullOrEmpty(result))
                    return result;

                var includeTasks = _.map(includes, function (flag)
                {
                    return self.getIncludeHandler(flag, result);
                });
                return [result, q.all(includeTasks)];
            })
            .spread(
            function handleIncludesProcessed(result, ...args)
            {
                self.logger.debug('Includes processed for %s', Utils.getClassName(self.dao.modelClass));
                var results = args[0];

                _.each(results, function (resultSet:any, index)
                {
                    result.set(includes[index], resultSet);
                });
                return result;
            });
    }

    /*
     * Perform search based on search query
     * Also fetch joint fields
     */
    search(search:Object, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var self:BaseDaoDelegate = this;

        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        return this.dao.search(search, fields, transaction)
            .then(
            function processIncludes(baseSearchResults):any
            {
                if (Utils.isNullOrEmpty(baseSearchResults))
                    return null;

                var includeTasks = _.map(includes, function (flag)
                {
                    return self.getIncludeHandler(flag, baseSearchResults);
                });
                return [baseSearchResults, q.all(includeTasks)];
            })
            .spread(
            function handleIncludesProcessed(baseSearchResults, ...args)
            {
                self.logger.debug('Includes processed for %s', Utils.getClassName(self.dao.modelClass));
                var results = args[0];

                _.each(baseSearchResults, function (baseSearchResult:any)
                {
                    _.each(results, function (resultSet:any, index)
                    {
                        baseSearchResult.set(includes[index], resultSet);
                    })
                });
                return baseSearchResults;
            });
    }

    create(object:Object, transaction?:Object):q.Promise<any>;
    create(object:Object[], transaction?:Object):q.Promise<any>;
    create(object:any, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(object))
            throw ('Invalid data. Trying to create object with null data');

        var self:BaseDaoDelegate = this;

        function prepareData(data:BaseModel)
        {
            var generatedId:number = new GlobalIdDelegate().generate(self.dao.modelClass.TABLE_NAME);
            data[BaseModel.COL_ID] = generatedId;
            data[BaseModel.COL_CREATED] = moment().valueOf();
            data[BaseModel.COL_UPDATED] = moment().valueOf();
            return data;
        };

        var newObject:any = (Utils.getObjectType(object) === 'Array') ? _.map(object, prepareData) : prepareData(object);

        return this.dao.create(newObject, transaction);
    }

    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        // Compose update statement based on newValues
        newValues[BaseModel.COL_UPDATED] = new Date().getTime();
        delete newValues[BaseModel.COL_CREATED];
        delete newValues[BaseModel.COL_ID];

        return this.dao.update(criteria, newValues, transaction);
    }

    delete(criteria:number, transaction?:Object, softDelete?:boolean):q.Promise<any>;
    delete(criteria:Object, transaction?:Object, softDelete?:boolean):q.Promise<any>;
    delete(criteria:any, transaction?:Object, softDelete:boolean = true):q.Promise<any>
    {
        if (softDelete)
            return this.dao.update(criteria, {'deleted': moment().valueOf()}, transaction);
        else
            return this.dao.delete(criteria, transaction);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return null;
    }
}
export = BaseDaoDelegate