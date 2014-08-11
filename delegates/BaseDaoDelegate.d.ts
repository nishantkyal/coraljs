import log4js = require('log4js');
import q = require('q');
import AbstractDao = require('../dao/AbstractDao');
import BaseModel = require('../models/BaseModel');
import ForeignKey = require('../models/ForeignKey');
declare class BaseDaoDelegate {
    public logger: log4js.Logger;
    public dao: AbstractDao;
    /** Can be constructed using just the model in case dao doesn't do anything special
    * e.g. Execute custom queries which AbstractDao doesn't support
    * @param dao
    */
    constructor(dao: typeof BaseModel);
    constructor(dao: AbstractDao);
    public get(id: any, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public find(search: Object, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public search(search: Object, fields?: string[], foreignKeys?: ForeignKey[], transaction?: Object): q.Promise<any>;
    public create(object: Object, transaction?: Object): q.Promise<any>;
    public create(object: Object[], transaction?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: any, transaction?: Object): q.Promise<any>;
    public update(criteria: number, newValues: any, transaction?: Object): q.Promise<any>;
    public delete(criteria: number, transaction?: Object, softDelete?: boolean): q.Promise<any>;
    public delete(criteria: Object, transaction?: Object, softDelete?: boolean): q.Promise<any>;
    public getIncludeHandler(include: any, result: any): q.Promise<any>;
}
export = BaseDaoDelegate;
