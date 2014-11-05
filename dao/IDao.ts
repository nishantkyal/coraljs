///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import AbstractModel                                        = require('../models/AbstractModel');
import IDaoFetchOptions                                     = require('../dao/IDaoFetchOptions');

interface IDao
{
    modelClass:typeof AbstractModel;
    create(data:Object[], transaction?:Object):q.Promise<any>;
    create(data:Object, transaction?:Object):q.Promise<any>;
    get(id:number[], options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>;
    get(id:number, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>;
    search(searchQuery?:Object, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    find(searchQuery:Object, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    update(criteria:number, newValues:any, transaction?:Object):q.Promise<any>;
    update(criteria:Object, newValues:any, transaction?:Object):q.Promise<any>;
    delete(criteria:number, transaction?:Object):q.Promise<any>;
    delete(criteria:Object, transaction?:Object):q.Promise<any>;
}
export = IDao