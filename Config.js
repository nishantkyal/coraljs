var nconf = require("nconf");

/**
* Utility class for accessing global app config
* Read from specified file
*/
var Config = (function () {
    function Config() {
    }
    Config.get = /** Getters */
    function (key) {
        return nconf.get(key);
    };

    Config.setDashboardIntegrationId = /* Setters */
    function (integrationId) {
        nconf.set(Config.DASHBOARD_INTEGRATION_ID, integrationId);
    };
    Config.DASHBOARD_INTEGRATION_ID = 'dashboard_integration_id';

    Config.ctor = (function () {
        nconf.file({ file: "/var/searchntalk/config/config.json" });
    })();
    return Config;
})();

module.exports = Config;

