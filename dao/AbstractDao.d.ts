/// <reference path="../_references.d.ts" />
import q = require('q');
import log4js = require('log4js');
import BaseModel = require('../models/BaseModel');
declare class AbstractDao {
    public modelClass: typeof BaseModel;
    public tableName: string;
    public logger: log4js.Logger;
    constructor(modelClass: typeof BaseModel);
    /**
    * Persist model
    * Can persist one or more at one time if all models have same data to be inserted
    * @param data
    * @param transaction
    */
    public create(data: Object[], transaction?: Object): q.Promise<any>;
    public create(data: Object, transaction?: Object): q.Promise<any>;
    /**
    * Get one or more rows by id
    * @param id
    * @param fields
    */
    public get(id: number[], fields?: string[], transaction?: Object): q.Promise<any>;
    public get(id: number, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Search. Return all results
    * @param searchQuery
    * @param options
    * @param fields
    * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any>}
    */
    public search(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Search. Return First result
    * @param searchQuery
    * @param fields
    * @returns {"q".Promise<U>|"q".Promise<undefined>|"q".Promise<any|null>}
    */
    public find(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    /**
    * Update based on criteria or id
    * @param criteria
    * @param newValues
    * @param transaction
    */
    public update(criteria: number, newValues: Object, transaction?: Object): q.Promise<any>;
    public update(criteria: Object, newValues: Object, transaction?: Object): q.Promise<any>;
    /**
    * Delete by criteria or id
    * @param criteria
    * @param transaction
    */
    public delete(criteria: number, transaction?: Object): q.Promise<any>;
    public delete(criteria: Object, transaction?: Object): q.Promise<any>;
    /** Helper method to convert query objects to SQL fragments **/
    public generateWhereStatements(criteria: Object): {
        where: string[];
        values: any[];
    };
}
export = AbstractDao;
