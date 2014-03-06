///<reference path='../_references.d.ts'/>
import express                                      = require('express');

class SessionStorageHelper
{
    private storeName:string;

    constructor(storeName:string)
    {
        this.storeName = storeName;
    }

    get(req:express.Request, key:string):any
    {
        try {
            return req.session[this.storeName][key];
        } catch(e) {
            return null;
        }
    }

    set(req:express.Request, key:string, value:any)
    {
        req.session[this.storeName] = req.session[this.storeName] || {};
        req.session[this.storeName][key] = value;
    }
}
export = SessionStorageHelper