///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import AbstractModel                                = require('../models/AbstractModel');

interface IDao
{
    modelClass:typeof AbstractModel;
    create(data:Object[], transaction?:Object):q.Promise<any>;
    create(data:Object, transaction?:Object):q.Promise<any>;
    get(id:number[], fields?:string[], transaction?:Object):q.Promise<any>;
    get(id:number, fields?:string[], transaction?:Object):q.Promise<any>;
    search(searchQuery?:Object, fields?:string[], transaction?:Object):q.Promise<any>
    find(searchQuery:Object, fields?:string[], transaction?:Object):q.Promise<any>
    update(criteria:number, newValues:Object, transaction?:Object):q.Promise<any>;
    update(criteria:Object, newValues:Object, transaction?:Object):q.Promise<any>;
    delete(criteria:number, transaction?:Object):q.Promise<any>;
    delete(criteria:Object, transaction?:Object):q.Promise<any>;
}
export = IDao