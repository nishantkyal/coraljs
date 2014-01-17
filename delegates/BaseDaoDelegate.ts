import log4js           = require('log4js');
import q                = require('q');
import IDao             = require('../dao/IDao');
import Utils            = require('../Utils');

class BaseDaoDelegate {

    logger:log4js.Logger;

    constructor()
    {
        this.logger = log4js.getLogger(Utils.getClassName(this));
    }

    get(id:any, fields?:string[]):q.makePromise
    {
        return this.getDao().get(id, fields);
    }

    /**
     * Perform search based on seacrh query
     * Also fetch joint fields
     * @param search
     * @param fields
     * @param supplimentaryModel
     * @param supplimentaryModelFields
     * @returns {q.makePromise}
     */
    search(search:Object, options?:Object):q.makePromise
    {
        return this.getDao().search(search, options);
    }

    create(object:Object, transaction?:any):q.makePromise
    {
        return this.getDao().create(object, transaction);
    }

    update(criteria:Object, newValues:Object, transaction?:any):q.makePromise
    {
        return this.getDao().update(criteria, newValues, transaction);
    }

    delete(id:string, transaction?:any):q.makePromise
    {
        return this.getDao().delete(id, transaction);
    }

    getDao():IDao
    {
        throw('getDao method not implemented');
        return null;
    }
}
export = BaseDaoDelegate