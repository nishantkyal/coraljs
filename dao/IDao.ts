import q            = require('q');
import BaseModel    = require('../models/BaseModel');

interface IDao
{
    create(data:any, transaction?:any):q.Promise<any>;
    get(id:String, fields?:string[]):q.Promise<any>;
    search(searchQuery:Object, options?:Object):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>;
    delete(id:number, softDelete:boolean, transaction?:any):q.Promise<any>;
    searchAndDelete(id:Object, softDelete:boolean, transaction?:any):q.Promise<any>;
    getModel():typeof BaseModel;
}
export = IDao