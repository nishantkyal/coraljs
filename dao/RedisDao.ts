///<reference path='../_references.d.ts'/>
import IDao                                                 = require('./IDao');
import IDaoFetchOptions                                     = require('./IDaoFetchOptions');
import AbstractModel                                        = require('../models/AbstractModel');
import q                                                    = require('q');

class RedisDao implements IDao
{
    modelClass:typeof AbstractModel;

    create(data:Object[], transaction?:Object):q.Promise<any>;
    create(data:Object, transaction?:Object):q.Promise<any>;
    create(data:any, transaction?:Object):q.Promise<any>
    {
        return null;
    }

    get(id:number[], options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>;
    get(id:number, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>;
    get(id:any, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        return null;
    }

    search(searchQuery?:Object, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        return null;
    }

    find(searchQuery:Object, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        return null;
    }

    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:Object):q.Promise<any>
    {
        return null;
    }

    delete(criteria:number, transaction?:Object):q.Promise<any>;
    delete(criteria:Object, transaction?:Object):q.Promise<any>;
    delete(criteria:any, transaction?:Object):q.Promise<any>
    {
        return null;
    }
}
export = RedisDao;