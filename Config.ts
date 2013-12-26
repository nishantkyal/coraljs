import nconf        = require("nconf")

/**
 * Utility class for accessing global app config
 * Read from specified file
 */
class Config {

    static DASHBOARD_INTEGRATION_ID:string              = 'dashboard_integration_id';

    /** Static constructor workaround */
    private static ctor = (() =>
    {
        nconf.file({file: "/var/searchntalk/config.json"});
    })();

    /** Getters */
    static get(key:string):any
    {
        return nconf.get(key);
    }

    /* Setters */
    static setDashboardIntegrationId(integrationId:string):void
    {
        nconf.set(Config.DASHBOARD_INTEGRATION_ID, integrationId);
    }

}
export = Config