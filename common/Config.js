var nconf = require("nconf");

/**
* Utility class for accessing global app config
* Read from specified file
*/
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
module.exports = Config;
//# sourceMappingURL=Config.js.map
