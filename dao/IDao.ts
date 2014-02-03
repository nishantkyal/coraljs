///<reference path='../_references.d.ts'/>
///<reference path='../models/BaseModel.ts'/>

module dao
{
    export interface IDao
    {
        create(data:Object, transaction?:any):Q.Promise<any>;
        get(id:String, fields?:string[]):Q.Promise<any>;
        search(searchQuery:Object, options?:Object):Q.Promise<any>;
        update(criteria:Object, newValues:Object, transaction?:any):Q.Promise<any>;
        delete(id:string, softDelete:boolean, transaction?:any):Q.Promise<any>;
        getModel():typeof models.BaseModel;
    }
}