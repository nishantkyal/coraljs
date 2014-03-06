///<reference path='../../SearchNTalk-Dashboard/_references.d.ts'/>
import q                                            = require('q');
import request                                      = require('request');
import log4js                                       = require('log4js');

/**
 * Helper class to make calls to Coral API server
 */
class AjaxHelper
{
    private static ajax(uri:string, method:string, data?:Object):q.Promise<any>
    {
        var deferred = q.defer<any>();

        request({
            uri: uri,
            method: method,
            json: data || true,
            callback: function (err:any, response:any, body:any)
            {
                if (err || response.statusCode != 200)
                    deferred.reject(err);
                else if (body)
                    deferred.resolve(body);
            }
        });

        return deferred.promise;
    }

    static get(uri:string, data?:Object):q.Promise<any>
    {
        return AjaxHelper.ajax(uri, 'get', data);
    }

    static put(uri:string, data?:Object):q.Promise<any>
    {
        return this.ajax(uri, 'put', data);
    }

    static post(uri:string, data?:Object):q.Promise<any>
    {
        return this.ajax(uri, 'post', data);
    }

    static delete(uri:string, data?:Object):q.Promise<any>
    {
        return this.ajax(uri, 'delete', data);
    }

}
export = AjaxHelper