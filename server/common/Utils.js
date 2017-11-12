"use strict";
const log4js = require("log4js");
const _ = require("underscore");
const URI = require("URIjs");
class Utils {
    static getRandomString(length, characters) {
        var buf = [];
        var chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }
        return buf.join('');
    }
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static isNullOrEmpty(val) {
        if (val == null || val == undefined || val == '' || val == {})
            return true;
        var objectType = this.getObjectType(val);
        if (objectType == 'Array' || objectType == 'String')
            return val.length == 0;
        if (objectType == 'Number' && isNaN(val))
            return true;
    }
    static getClassName(object) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(object['constructor'].toString());
        return (results && results.length > 1) ? results[1] : "";
    }
    static copyProperties(source, target) {
        for (var prop in source) {
            if (target[prop] !== undefined)
                target[prop] = source[prop];
            else
                log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
        }
    }
    static camelToSnakeCase(camelCasedString) {
        var frags = camelCasedString.match(/([A-Z]|^)[a-z]+/g);
        var lowerCasedFrags = _.map(frags, function (frag) {
            return frag.toLowerCase();
        });
        return lowerCasedFrags.join('_');
    }
    static snakeToCamelCase(snakeCasedString) {
        var frags = snakeCasedString.toLowerCase().split('_');
        var camelCaseFrags = _.map(frags, function (frag) {
            return frag.replace(/^([a-z])/, function (m, p1) { return p1.toUpperCase(); });
        });
        return camelCaseFrags.join('');
    }
    static snakeCaseToNormalText(snakeCasedString) {
        snakeCasedString = snakeCasedString.replace(/_/g, ' ');
        snakeCasedString = snakeCasedString.toLowerCase();
        snakeCasedString = snakeCasedString.replace(/(^[a-z]|\s[a-z]|\/[a-z])/g, function (m, p) { return m.toUpperCase(); });
        return snakeCasedString;
    }
    static enumToNormalText(enumObject) {
        var newEnumObject = {};
        for (var key in enumObject) {
            var value = enumObject[key];
            if (Utils.getObjectType(value) == 'String')
                newEnumObject[key] = Utils.snakeCaseToNormalText(value);
        }
        return newEnumObject;
    }
    static getObjectType(obj) {
        var type = Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
        return type === 'Object' ? obj.toString().replace('[object ', '').replace(']', '') : type;
    }
    static createSimpleObject(...args) {
        var obj = {};
        for (var i = 0; i < args.length; i += 2) {
            var key = args[i];
            var val = args[i + 1];
            if (!Utils.isNullOrEmpty(key))
                obj[key] = val;
        }
        return obj;
    }
    static repeatChar(char, times, delimiter = '') {
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
    }
    static escapeHTML(s) {
        return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    static unescapeHTML(s) {
        return s.replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }
    static addQueryToUrl(baseUrl, query) {
        return URI(baseUrl).addQuery(query).href();
    }
    static escapeObject(obj) {
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
    }
    static unEscapeObject(obj) {
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
    }
    static setLongerTimeout(func, interval, ...args) {
        var maxTimeout = 0x7FFFFFFF;
        if (interval < maxTimeout)
            return setTimeout(func, interval, args);
        else
            return setTimeout(Utils.setLongerTimeout(func, interval - maxTimeout, args), maxTimeout);
    }
    static generateUrl(urlPattern, values, baseUrl) {
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
    }
    static removeParameterFromUrl(urlPattern) {
        var urlParamTypeRegex = new RegExp('\\(([^\\(]*)\\)', 'i');
        var urlParamRegex = new RegExp(':.*/');
        var urlParamEndRegex = new RegExp('/:.*$');
        urlPattern = urlPattern.replace(urlParamTypeRegex, '').replace(urlParamRegex, '');
        urlPattern = urlPattern.replace(urlParamEndRegex, '');
        return urlPattern;
    }
}
module.exports = Utils;
//# sourceMappingURL=Utils.js.map