///<reference path='../node.d.ts'/>
var q = require('q');
var log4js = require('log4js');
var _ = require('underscore');

var Utils = (function () {
    function Utils() {
    }
    Utils.getRandomString = /** Get random string **/
    function (length, characters) {
        var buf = [];
        var chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    };

    Utils.getRandomInt = /** Get random number **/
    function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    Utils.getRejectedPromise = /**
    * Get a promise that'll get rejected in next tick
    *  Used when we need to cancel an operation for invalid input
    */
    function (errorMessage) {
        var deferred = q.defer();
        process.nextTick(function fail() {
            deferred.reject(errorMessage);
        });
        return deferred.promise;
    };

    Utils.isNullOrEmpty = function (str) {
        return str == null || str == undefined || str.trim().length == 0;
    };

    Utils.getClassName = function (object) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(object['constructor'].toString());
        return (results && results.length > 1) ? results[1] : "";
    };

    Utils.copyProperties = function (source, target) {
        for (var prop in source) {
            if (target[prop] !== undefined) {
                target[prop] = source[prop];
            } else {
                log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
            }
        }
    };

    Utils.camelToUnderscore = function (camelCasedString) {
        var frags = camelCasedString.match(/[A-Z][a-z]+/g);
        var lowerCasedFrags = _.map(frags, function (frag) {
            return frag.toLowerCase();
        });
        return lowerCasedFrags.join('_');
    };
    return Utils;
})();

module.exports = Utils;

