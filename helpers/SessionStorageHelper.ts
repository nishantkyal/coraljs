///<reference path='../_references.d.ts'/>
import express                                      = require('express');
import log4js                                       = require('log4js');
import Utils                                        = require('../common/Utils');

class SessionStorageHelper
{
    private storeName:string;
    private logger:log4js.Logger

    constructor(storeName:string)
    {
        this.storeName = storeName;
        this.logger = log4js.getLogger(Utils.getClassName(this) + '-' + storeName);
    }

    get(req:express.Request, key:string):any
    {
        try {
            return JSON.parse(req.session[this.storeName][key]);
        } catch(e) {
            this.logger.fatal("Couldn't get session key %s from store: %s. Error: %s", key, this.storeName, e);
        }
    }

    set(req:express.Request, key:string, value:any)
    {
        req.session[this.storeName] = req.session[this.storeName] || {};
        try {
            req.session[this.storeName][key] = JSON.stringify(value);
        } catch(e) {
            this.logger.fatal("Couldn't set session key %s to %s in store: %s. Error: %s", key, value, this.storeName, e);
        }
    }
}
export = SessionStorageHelper