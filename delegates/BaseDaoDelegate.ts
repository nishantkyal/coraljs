///<reference path='../_references.d.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='./GlobalIDDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>

module delegates
{
    export class BaseDaoDelegate
    {
        logger:log4js_module.Logger;

        constructor()
        {
            this.logger = log4js.getLogger(common.Utils.getClassName(this));
        }

        get(id:any, fields?:string[], includes?:any):Q.IPromise<any>
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
        getIncludeHandler(include:string, result:any):Q.IPromise<any> { return null; }

        /**
         * Perform search based on seacrh query
         * Also fetch joint fields
         * @param search
         * @param fields
         * @param supplimentaryModel
         * @param supplimentaryModelFields
         * @returns {Q.IPromise<any>}
         */
            search(search:Object, options?:Object):Q.IPromise<any>
        {
            return this.getDao().search(search, options);
        }

        create(object:any, transaction?:any):Q.IPromise<any>
        {
            // Compose insert statement based on data
            var generatedId:number;// = new GlobalIdDelegate().generate(this.getDao().getModel().TABLE_NAME);
            object['id'] = generatedId;
            object['created'] = new Date().getTime();
            object['updated'] = new Date().getTime();

            return this.getDao().create(object, transaction);
        }

        update(criteria:Object, newValues:Object, transaction?:any):Q.IPromise<any>
        {
            // Compose update statement based on newValues
            newValues['updated'] = new Date().getTime();
            delete newValues['created'];
            delete newValues['id'];

            return this.getDao().update(criteria, newValues, transaction);
        }

        delete(id:string, transaction?:any):Q.IPromise<any>
        {
            return this.getDao().delete(id, transaction);
        }

        getDao():dao.IDao
        {
            throw('getDao method not implemented');
            return null;
        }

    }
}