import q            = require('q');

interface IDao
{
    create(data:Object, transaction?:any):q.makePromise;
    get(id:String, fields?:string[]):q.makePromise;
    search(searchQuery:Object, options?:Object):q.makePromise;
    update(criteria:Object, newValues:Object, transaction?:any):q.makePromise;
    delete(id:string, softDelete:boolean, transaction?:any):q.makePromise;
}
export = IDao