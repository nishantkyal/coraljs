import q            = require('q');
import BaseModel    = require('../models/BaseModel');

interface IDao
{
    create(data:any, transaction?:any):q.Promise<any>;
    get(id:number, fields?:string[]):q.Promise<any>;
    find(searchQuery:Object, options?:Object, fields?:string[]):q.Promise<any>;
    search(searchQuery:Object, options?:Object, fields?:string[]):q.Promise<any>;
    update(id:number, newValues:any, transaction?:any):q.Promise<any>;
    update(criteria:Object, newValues:any, transaction?:any):q.Promise<any>;
    delete(id:number, transaction?:any):q.Promise<any>;
    delete(criteria:Object, transaction?:any):q.Promise<any>;
    getModel():typeof BaseModel;
}
export = IDao