///<reference path='../_references.d.ts'/>
import _                = require('underscore');
import log4js           = require('log4js');
import q                = require('q');
import IDao             = require('../dao/IDao');
import Utils            = require('../common/Utils');
import BaseModel        = require('../models/BaseModel');
import GlobalIdDelegate = require('../delegates/GlobalIDDelegate');

class BaseDaoDelegate {

    logger:log4js.Logger;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    get(id:any, fields?:string[], includes?:string[]):q.Promise<any>
    {
        var that = this;
        includes = includes || [];
        var rawResult;

        // 1. Get the queried object
        // 2. Parse flags and add handlers to a queue
        // 3. When queue is complete, concat all results to queried object and return
        return this.getDao().get(id, fields)
            .then(
            function processIncludes(result)
            {
                rawResult = result;
                var includeTasks = [];
                _.each(includes, function (flag) {
                    var handler;
                    if (handler = that.getIncludeHandler(flag, result))
                        includeTasks.push(handler);
                });
                return q.all(includeTasks);
            })
            .then(
            function handleIncludesProcessed(...args)
            {
                for (var i = 0; i < args[0].length; i++)
                    rawResult[includes[i]] = args[0][i];
                return rawResult;
            });
    }

    /* Abstract method that defines how flags are handled in get query */
    getIncludeHandler(include:string, result:any):q.Promise<any> { return null; }

    /**
     * Perform search based on seacrh query
     * Also fetch joint fields
     * @param search
     * @param fields
     * @param supplimentaryModel
     * @param supplimentaryModelFields
     * @returns {q.Promise<any>}
     */
    search(search:Object, options?:Object):q.Promise<any>
    {
        return this.getDao().search(search, options);
    }

    create(object:Object, transaction?:any):q.Promise<any>
    {
        // Compose insert statement based on data
        var generatedId:number = new GlobalIdDelegate().generate(this.getDao().getModel().TABLE_NAME);
        object['id'] = generatedId;
        object['created'] = new Date().getTime();
        object['updated'] = new Date().getTime();

        return this.getDao().create(object, transaction);
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.Promise<any>
    {
        // Compose update statement based on newValues
        newValues['updated'] = new Date().getTime();
        delete newValues['created'];
        delete newValues['id'];

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