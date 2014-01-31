///<reference path='../../DefinitelyTyped/nconf/nconf.d.ts'/>
/**
* Utility class for accessing global app config
* Read from specified file
*/
var common;
(function (common) {
    var Config = (function () {
        function Config() {
        }
        /** Getters */
        Config.get = function (key) {
            return nconf.get(key);
        };
        Config.ctor = (function () {
            nconf.file({ file: "/var/searchntalk/config/config.json" });
        })();
        return Config;
    })();
    common.Config = Config;
})(common || (common = {}));
//# sourceMappingURL=Config.js.map
