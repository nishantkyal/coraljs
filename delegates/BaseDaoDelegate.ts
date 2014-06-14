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
     * e.g. Execute custom queries which AbstractDao doesnt support
     * @param dao
     */
    constructor(dao:typeof BaseModel);
    constructor(dao:AbstractDao);
    constructor(dao:any)
    {
        this.dao = Utils.getObjectType(dao) == 'Object' ? dao : new AbstractDao(dao);
    }

    get(id:any, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        if (Utils.getObjectType(id) == 'Array' && id.length > 0)
            return this.search({'id': id}, fields, includes);

        if (Utils.getObjectType(id) == 'Array' && id.length == 1)
            id = id[0];


        var self = this;
        var rawResult;

        // 1. Get the queried object
        // 2. Parse flags and add handlers to a queue
        // 3. When queue is complete, concat all results to queried object and return
        return this.dao.get(id, fields, transaction)
            .then(
            function processIncludes(result):any
            {
                if (Utils.isNullOrEmpty(result))
                    return result;

                rawResult = result;
                var includeTasks = [];
                _.each(includes, function (flag)
                {
                    var handler;
                    if (handler = self.getIncludeHandler(flag, result))
                        includeTasks.push(handler);
                });
                return q.all(includeTasks);
            })
            .then(
            function handleIncludesProcessed(...args):any
            {
                for (var i = 0; i < args[0].length; i++)
                    rawResult.set(includes[i], args[0][i]);
                return rawResult;
            });
    }

    /* Abstract method self defines how flags are handled in get query */
    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return null;
    }

    find(search:Object, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var self = this;
        var rawResult;

        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        return this.dao.find(search, fields, transaction)
            .then(
            function processIncludes(result)
            {
                if (Utils.isNullOrEmpty(result))
                    return result;

                rawResult = result;
                var includeTasks = [];
                _.each(includes, function (flag)
                {
                    var handler;
                    if (handler = self.getIncludeHandler(flag, result))
                        includeTasks.push(handler);
                });
                return q.all(includeTasks);
            })
            .then(
            function handleIncludesProcessed(...args)
            {
                var results = args[0];

                _.each(results, function (resultSet:any, index)
                {
                    // TODO: Implement foreign keys so mapping can work in search
                    var foreignKeyColumn = null;
                    rawResult.set(includes[index], _.map(resultSet, function (res)
                    {
                        // return result[foreignKeyColumn] == res['id'] ? res : null;
                        return res;
                    }));
                });
                return rawResult;
            });
    }

    /*
     * Perform search based on seacrh query
     * Also fetch joint fields
     */
    search(search:Object, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var self = this;
        var rawResult;

        fields = fields || this.dao.modelClass.DEFAULT_FIELDS;

        return this.dao.search(search, fields, transaction)
            .then(
            function processIncludes(result):any
            {
                if (result.length == 0)
                    return result;

                rawResult = result;
                var includeTasks = [];
                _.each(includes, function (flag)
                {
                    var handler;
                    if (handler = self.getIncludeHandler(flag, result))
                        includeTasks.push(handler);
                });
                return q.all(includeTasks);
            })
            .then(
            function handleIncludesProcessed(...args)
            {
                var results = args[0];

                _.each(rawResult, function (result:any)
                {
                    _.each(results, function (resultSet:any, index)
                    {
                        // TODO: Implement foreign keys so mapping can work in search
                        var foreignKeyColumn = null;
                        result.set(includes[index], _.map(resultSet, function (res)
                        {
                            // return result[foreignKeyColumn] == res['id'] ? res : null;
                            return res;
                        }));
                    });
                });
                return rawResult;
            });
    }

    create(object:Object, transaction?:Object):q.Promise<any>;
    create(object:Object[], transaction?:Object):q.Promise<any>;
    create(object:any, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(object))
            throw ('Invalid data. Trying to create object with null data');

        var self = this;

        function prepareData(data)
        {
            var generatedId:number = new GlobalIdDelegate().generate(self.dao.modelClass.TABLE_NAME);
            data[BaseModel.ID] = data[BaseModel.ID] || generatedId;
            data[BaseModel.CREATED] = moment().valueOf();
            data[BaseModel.UPDATED] = moment().valueOf();
            return data;
        };

        var newObject = (Utils.getObjectType(object) == 'Array') ? _.map(object, prepareData) : prepareData(object);

        return this.dao.create(newObject, transaction);
    }

    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        // Compose update statement based on newValues
        newValues[BaseModel.UPDATED] = new Date().getTime();
        delete newValues[BaseModel.CREATED];
        delete newValues[BaseModel.ID];

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

}
export = BaseDaoDelegate