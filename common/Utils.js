"use strict";
var log4js = require("log4js");
var _ = require("underscore");
var URI = require("urijs");
var Utils = (function () {
    function Utils() {
    }
    /* Get random string */
    Utils.getRandomString = function (length, characters) {
        var buf = [];
        var chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }
        return buf.join('');
    };
    /* Get random number */
    Utils.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
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
    Utils.isNullOrEmpty = function (val) {
        if (val == null || val == undefined || val == '' || val == {})
            return true;
        var objectType = this.getObjectType(val);
        if (objectType == 'Array' || objectType == 'String')
            return val.length == 0;
        if (objectType == 'Number' && isNaN(val))
            return true;
    };
    Utils.getClassName = function (object) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(object['constructor'].toString());
        return (results && results.length > 1) ? results[1] : "";
    };
    Utils.copyProperties = function (source, target) {
        for (var prop in source) {
            if (target[prop] !== undefined)
                target[prop] = source[prop];
            else
                log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
        }
    };
    Utils.camelToSnakeCase = function (camelCasedString) {
        var frags = camelCasedString.match(/([A-Z]|^)[a-z]+/g);
        var lowerCasedFrags = _.map(frags, function (frag) {
            return frag.toLowerCase();
        });
        return lowerCasedFrags.join('_');
    };
    Utils.snakeToCamelCase = function (snakeCasedString) {
        var frags = snakeCasedString.toLowerCase().split('_');
        var camelCaseFrags = _.map(frags, function (frag) {
            return frag.replace(/^([a-z])/, function (m, p1) { return p1.toUpperCase(); });
        });
        return camelCaseFrags.join('');
    };
    Utils.snakeCaseToNormalText = function (snakeCasedString) {
        snakeCasedString = snakeCasedString.replace(/_/g, ' ');
        snakeCasedString = snakeCasedString.toLowerCase();
        snakeCasedString = snakeCasedString.replace(/(^[a-z]|\s[a-z]|\/[a-z])/g, function (m, p) { return m.toUpperCase(); });
        return snakeCasedString;
    };
    Utils.enumToNormalText = function (enumObject) {
        var newEnumObject = {};
        for (var key in enumObject) {
            var value = enumObject[key];
            if (Utils.getObjectType(value) == 'String')
                newEnumObject[key] = Utils.snakeCaseToNormalText(value);
        }
        return newEnumObject;
    };
    Utils.getObjectType = function (obj) {
        var type = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
        return type === 'Object' ? obj.toString().replace('[object ', '').replace(']', '') : type;
    };
    Utils.createSimpleObject = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var obj = {};
        for (var i = 0; i < args.length; i += 2) {
            var key = args[i];
            var val = args[i + 1];
            if (!Utils.isNullOrEmpty(key))
                obj[key] = val;
        }
        return obj;
    };
    Utils.repeatChar = function (char, times, delimiter) {
        if (delimiter === void 0) { delimiter = ''; }
        if (times <= 1)
            return char;
        if (char.trim().length > 1) {
            var repeatArray = [];
            for (var i = 0; i < times; i++)
                repeatArray.push(char);
            return repeatArray.join(delimiter);
        }
        var repeatString = Array(times + 1).join(char);
        return delimiter === '' ? repeatString : repeatString.split('').join(delimiter);
    };
    Utils.escapeHTML = function (s) {
        return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };
    Utils.unescapeHTML = function (s) {
        return s.replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    };
    Utils.addQueryToUrl = function (baseUrl, query) {
        return URI(baseUrl).addQuery(query).href();
    };
    Utils.escapeObject = function (obj) {
        var dataAsArray = [].concat(obj);
        var isArray = Object.prototype.toString.call(obj) == '[object Array]' ? true : false;
        var escapedData = _.map(dataAsArray, function (data) {
            for (var key in data) {
                var value = data[key];
                if (typeof value == 'string') {
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
        });
        if (isArray)
            return escapedData;
        else
            return escapedData[0];
    };
    Utils.unEscapeObject = function (obj) {
        var dataAsArray = [].concat(obj);
        var isArray = Object.prototype.toString.call(obj) == '[object Array]' ? true : false;
        var escapedData = _.map(dataAsArray, function (data) {
            for (var key in data) {
                var value = data[key];
                if (typeof value == 'string') {
                    value = value.replace(/&quot;/g, '"')
                        .replace(/&squot;/g, '\'')
                        .replace(/&bslash/g, '\\')
                        .replace(/&endl;/g, '\n')
                        .replace(/&tab;/g, '\t');
                    data[key] = value;
                }
            }
            return data;
        });
        if (isArray)
            return escapedData;
        else
            return escapedData[0];
    };
    Utils.setLongerTimeout = function (func, interval) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var maxTimeout = 0x7FFFFFFF; //setTimeout limit is MAX_INT32=(2^31-1)
        if (interval < maxTimeout)
            return setTimeout(func, interval, args);
        else
            return setTimeout(Utils.setLongerTimeout(func, interval - maxTimeout, args), maxTimeout);
    };
    /*
     * Helper method to generate URLs with values substituted for parameters (if supplied)
     * @param urlPattern
     * @param values
     * @returns {string}
     */
    Utils.generateUrl = function (urlPattern, values, baseUrl) {
        if (values)
            for (var key in values)
                if (values[key] != null) {
                    var urlParamRegex = new RegExp(':' + key);
                    var urlParamTypeRegex = new RegExp('\\(([^\\(]*)\\)', 'i');
                    urlPattern = urlPattern
                        .replace(urlParamTypeRegex, '')
                        .replace(urlParamRegex, values[key]);
                }
        if (!Utils.isNullOrEmpty(baseUrl))
            urlPattern = URI(baseUrl).path(urlPattern).href();
        return urlPattern;
    };
    Utils.removeParameterFromUrl = function (urlPattern) {
        var urlParamTypeRegex = new RegExp('\\(([^\\(]*)\\)', 'i');
        var urlParamRegex = new RegExp(':.*/');
        var urlParamEndRegex = new RegExp('/:.*$');
        urlPattern = urlPattern.replace(urlParamTypeRegex, '').replace(urlParamRegex, '');
        urlPattern = urlPattern.replace(urlParamEndRegex, '');
        return urlPattern;
    };
    return Utils;
}());
module.exports = Utils;
//# sourceMappingURL=Utils.js.map