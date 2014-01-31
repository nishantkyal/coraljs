///<reference path='../_references.d.ts'/>
///<reference path='../models/BaseModel.ts'/>

module dao
{
    export interface IDao
    {
        create(data:Object, transaction?:any):Q.IPromise<any>;
        get(id:String, fields?:string[]):Q.IPromise<any>;
        search(searchQuery:Object, options?:Object):Q.IPromise<any>;
        update(criteria:Object, newValues:Object, transaction?:any):Q.IPromise<any>;
        delete(id:string, softDelete:boolean, transaction?:any):Q.IPromise<any>;
        getModel():typeof models.BaseModel;
    }
}