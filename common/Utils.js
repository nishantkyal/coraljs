///<reference path='../_references.d.ts'/>
var common;
(function (common) {
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

        /**
        * Get a promise that'll get rejected in next tick
        *  Used when we need to cancel an operation for invalid input
        */
        Utils.getRejectedPromise = function (errorMessage) {
            var deferred = q.defer();
            process.nextTick(function fail() {
                deferred.reject(errorMessage);
            });
            return deferred.promise;
        };

        Utils.isNullOrEmpty = function (str) {
            return str == null || str == undefined || str.toString().trim().length == 0;
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
                    //log4js.getDefaultLogger().debug("Cannot set undefined property: " + prop);
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

        Utils.getObjectType = function (obj) {
            return Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
        };

        Utils.surroundWithQuotes = function (val) {
            if (this.getObjectType(val) != 'String')
                return val;
            return "'" + val + "'";
        };
        return Utils;
    })();
    common.Utils = Utils;
})(common || (common = {}));
