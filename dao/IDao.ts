import AbstractModel                                        = require('../models/AbstractModel');
import IDaoFetchOptions                                     = require('../dao/IDaoFetchOptions');

interface IDao
{
    modelClass:typeof AbstractModel;
    create(data:Object[], transaction?:Object):Promise<any>;
    create(data:Object, transaction?:Object):Promise<any>;
    get(id:number[], options?:IDaoFetchOptions, transaction?:Object):Promise<any>;
    get(id:number, options?:IDaoFetchOptions, transaction?:Object):Promise<any>;
    search(searchery?:Object, options?:IDaoFetchOptions, transaction?:Object):Promise<any>
    find(searchery:Object, options?:IDaoFetchOptions, transaction?:Object):Promise<any>
    update(criteria:number, newValues:any, transaction?:Object):Promise<any>;
    update(criteria:Object, newValues:any, transaction?:Object):Promise<any>;
    delete(criteria:number, transaction?:Object):Promise<any>;
    delete(criteria:Object, transaction?:Object):Promise<any>;
}
export = IDao