///<reference path='../_references.d.ts'/>
import log4js           = require('log4js');
import _                = require('underscore');

class Utils
{
    /* Get random string */
    static getRandomString(length:number, characters?:string)
    {
        var buf = [];
        var chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (var i = 0; i < length; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    }

    /* Get random number */
    static getRandomInt(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get a promise that'll get rejected in next tick
     *  Used when we need to cancel an operation for invalid input
    static getRejectedPromise(errorMessage:string):q.Promise<any>
    {
        var deferred = q.defer();
        process.nextTick(function fail() {
            deferred.reject(errorMessage);
        });
        return deferred.promise;
    }
    */
    static getObjectType(obj:any):string
    {
        var type:string = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
        return type === 'Object' ? obj.toString().replace('[object ', '').replace(']', '') : type;
    }

    static isNullOrEmpty(val:any):boolean
    {
        var objectType:string = this.getObjectType(val);
        if (objectType == 'Array' || objectType == 'String')
            return val.length == 0;
        if (objectType == 'Number' && isNaN(val))
            return true;
        else
            return val == null || val == undefined;
    }

    static getClassName(object:Object):string
    {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(object['constructor'].toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    static copyProperties(source:any, target:any):void {
        for(var prop in source){
            if(target[prop] !== undefined){
                target[prop] = source[prop];
            }
            else {
                log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
            }
        }
    }

    static camelToUnderscore(camelCasedString:string)
    {
        var frags:Array<string> = camelCasedString.match(/[A-Z][a-z]+/g);
        var lowerCasedFrags:Array<string> = _.map(frags, function(frag:string) {
            return frag.toLowerCase();
        })
        return lowerCasedFrags.join('_');
    }

    static surroundWithQuotes(val:any):string{
        if (Utils.getObjectType(val) == 'String')
            return "'" + val + "'";
        return val;
    }

    static createSimpleObject(key:string, value:any):Object
    {
        var obj:Object = {};
        if (!Utils.isNullOrEmpty(key))
            obj[key] = value;
        return obj;
    }

}
export = Utils