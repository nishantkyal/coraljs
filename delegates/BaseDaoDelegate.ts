///<reference path='../_references.d.ts'/>
import _                = require('underscore');
import log4js           = require('log4js');
import q                = require('q');
import IDao             = require('../dao/IDao');
import Utils            = require('../common/Utils');
import BaseModel        = require('../models/BaseModel');
import GlobalIdDelegate = require('../delegates/GlobalIDDelegate');
import IncludeFlag      = require('../enums/IncludeFlag');

class BaseDaoDelegate
{

    logger:log4js.Logger;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    get(id:any, fields?:string[], includes:IncludeFlag[] = []):q.Promise<any>
    {
        if (Utils.getObjectType(id) == 'Array' && id.length > 0)
            return this.search({'id': id}, {'fields': fields}, includes);

        if (Utils.getObjectType(id) == 'Array' && id.length == 1)
            id = id[0];

        var self = this;
        var rawResult;

        // 1. Get the queried object
        // 2. Parse flags and add handlers to a queue
        // 3. When queue is complete, concat all results to queried object and return
        return this.getDao().get(id, fields)
            .then(
            function processIncludes(result):any
            {
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
                    rawResult[includes[i]] = args[0][i];
                return rawResult;
            });
    }

    /* Abstract method self defines how flags are handled in get query */
    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return null;
    }

    /*
     * Perform search based on seacrh query
     * Also fetch joint fields
     */
    search(search:Object, options?:Object, includes:IncludeFlag[] = []):q.Promise<any>
    {
        var self = this;
        var rawResult;

        return this.getDao().search(search, options)
            .then(
            function processIncludes(result)
            {
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

                _.each(rawResult, function (result)
                {
                    _.each(results, function(resultSet:any, index)
                    {
                        // TODO: Implement foreign keys so mapping can work in search
                        var foreignKeyColumn = null;
                        result[includes[index]] = _.map(resultSet, function (res)
                        {
                            // return result[foreignKeyColumn] == res['id'] ? res : null;
                            return res;
                        });

                    });
                });
                return rawResult;
            });
    }

    create(object:any, transaction?:any):q.Promise<any>
    {
        var generatedId:number = new GlobalIdDelegate().generate(this.getDao().getModel().TABLE_NAME);
        object[BaseModel.ID] = generatedId;
        object[BaseModel.CREATED] = new Date().getTime();
        object[BaseModel.UPDATED] = new Date().getTime();

        return this.getDao().create(object, transaction);
    }

    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        // Compose update statement based on newValues
        newValues[BaseModel.UPDATED] = new Date().getTime();
        delete newValues[BaseModel.CREATED];
        delete newValues[BaseModel.ID];

        return this.getDao().update(criteria, newValues, transaction);
    }

    delete(id:string, transaction?:any):q.Promise<any>
    {
        return this.getDao().delete(id, transaction);
    }

    getDao():IDao
    {
        throw('getDao method not implemented');
        return null;
    }

}
export = BaseDaoDelegate