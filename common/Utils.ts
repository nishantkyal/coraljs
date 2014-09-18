///<reference path='../_references.d.ts'/>
import log4js                                       = require('log4js');
import _                                            = require('underscore');
import URI                                          = require('URIjs');

class Utils
{
    /* Get random string */
    static getRandomString(length:number, characters?:string)
    {
        var buf = [];
        var chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (var i = 0; i < length; ++i)
        {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    }

    /* Get random number */
    static getRandomInt(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /*
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

    static copyProperties(source:any, target:any):void
    {
        for (var prop in source)
        {
            if (target[prop] !== undefined)
                target[prop] = source[prop];
            else
                log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
        }
    }

    static camelToSnakeCase(camelCasedString:string):string
    {
        var frags:Array<string> = camelCasedString.match(/[A-Z][a-z]+/g);
        var lowerCasedFrags:Array<string> = _.map(frags, function (frag:string)
        {
            return frag.toLowerCase();
        })
        return lowerCasedFrags.join('_');
    }

    static snakeToCamelCase(snakeCasedString:string):string
    {
        var frags:Array<string> = snakeCasedString.toLowerCase().split('_');
        var camelCaseFrags:Array<string> = _.map(frags, function (frag:string)
        {
            return frag.replace(/^([a-z])/, function (m:string, p1):string { return p1.toUpperCase(); });
        });
        return camelCaseFrags.join('');
    }

    static snakeCaseToNormalText(snakeCasedString:string):string
    {
        snakeCasedString = snakeCasedString.replace(/_/g, ' ');
        snakeCasedString = snakeCasedString.toLowerCase();
        snakeCasedString = snakeCasedString.replace(/(^[a-z]|\s[a-z]|\/[a-z])/g, function (m:string, p):string { return m.toUpperCase(); })
        return snakeCasedString;
    }

    static enumToNormalText(enumObject:Object)
    {
        var newEnumObject = {};
        for (var key in enumObject)
        {
            var value = enumObject[key];
            if (Utils.getObjectType(value) == 'String')
                newEnumObject[key] = Utils.snakeCaseToNormalText(value);
        }
        return newEnumObject;
    }

    static getObjectType(obj:any):string
    {
        var type:string = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
        return type === 'Object' ? obj.toString().replace('[object ', '').replace(']', '') : type;
    }

    static createSimpleObject(...args):Object
    {
        var obj:Object = {};
        for (var i = 0; i < args.length; i += 2)
        {
            var key = args[i];
            var val = args[i + 1];
            if (!Utils.isNullOrEmpty(key))
                obj[key] = val;
        }
        return obj;
    }

    static repeatChar(char:string, times:number, delimiter:string = ''):string
    {
        if (times <= 1)
            return char;

        if (char.trim().length > 1)
        {
            var repeatArray = [];
            for (var i = 0; i < times; i++)
                repeatArray.push(char);
            return repeatArray.join(delimiter);
        }

        var repeatString:string = Array(times + 1).join(char);
        return delimiter === '' ? repeatString : repeatString.split('').join(delimiter);
    }

    static escapeHTML(s:string):string
    {
        return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    static unescapeHTML(s:string):string
    {
        return s.replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    static addQueryToUrl(baseUrl:string, query:Object):string
    {
        return URI(baseUrl).addQuery(query).href();
    }

    static escapeObject(Obj:Object):Object;
    static escapeObject(Obj:Object[]):Object[];
    static escapeObject(obj:any):any
    {
        var dataAsArray = [].concat(obj);
        var isArray = Object.prototype.toString.call(obj) == '[object Array]' ? true : false;

        var escapedData = _.map(dataAsArray, function (data)
        {
            for (var key in data)
            {
                var value = data[key];
                if (typeof value == 'string')
                {
                    value = value.replace(/"/g, '&quot;')
                        .replace(/'/g, '&squot;')
                        .replace(/\\/g, '&bslash')
                        .replace(/\n/g, '&endl;')
                        .replace(/\t/g, '&tab;');
                    data[key] = value;
                }
                else if (Object.prototype.toString.call(value) == '[object Array]')
                    data[key] = Utils.escapeObject(value);
            }
            return data;
        })

        if (isArray)
            return escapedData;
        else
            return escapedData[0];
    }

    static unEscapeObject(obj:Object):Object;
    static unEscapeObject(obj:Object[]):Object[];
    static unEscapeObject(obj:any):any
    {
        var dataAsArray = [].concat(obj);
        var isArray = Object.prototype.toString.call(obj) == '[object Array]' ? true : false;

        var escapedData = _.map(dataAsArray, function (data)
        {
            for (var key in data)
            {
                var value = data[key];
                if (typeof value == 'string')
                {
                    value = value.replace(/&quot;/g, '"')
                        .replace(/&squot;/g, '\'')
                        .replace(/&bslash/g, '\\')
                        .replace(/&endl;/g, '\n')
                        .replace(/&tab;/g, '\t');
                    data[key] = value;
                }
            }
            return data;
        })

        if (isArray)
            return escapedData;
        else
            return escapedData[0];
    }

    static setLongerTimeout(func:Function, interval:number, ...args)
    {
        var maxTimeout = 0x7FFFFFFF; //setTimeout limit is MAX_INT32=(2^31-1)
        if (interval < maxTimeout)
            return setTimeout(func, interval, args);
        else
            return setTimeout(Utils.setLongerTimeout(func, interval - maxTimeout, args), maxTimeout);
    }

    /*
     * Helper method to generate URLs with values substituted for parameters (if supplied)
     * @param urlPattern
     * @param values
     * @returns {string}
     */
    static generateUrl(urlPattern:string, values?:Object, baseUrl?:string):string
    {
        if (values)
            for (var key in values)
                if (values[key] != null)
                {
                    var urlParamRegex:RegExp = new RegExp(':' + key);
                    var urlParamTypeRegex:RegExp = new RegExp('\\(([^\\(]*)\\)', 'i');
                    urlPattern = urlPattern
                        .replace(urlParamTypeRegex, '')
                        .replace(urlParamRegex, values[key]);
                }
        if (!Utils.isNullOrEmpty(baseUrl))
            urlPattern = URI(urlPattern).relativeTo(baseUrl).href();

        return urlPattern;
    }
}
export = Utils