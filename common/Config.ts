///<reference path='../_references.d.ts'/>
import nconf        = require("nconf");

/*
 * Utility class for accessing global app config
 * Read from specified file
 */
class Config
{
    /* Static constructor workaround */
    private static ctor = (() =>
    {
        nconf.file({file: "/var/searchntalk/config/config.json"});
    })();

    /* Getters */
    static get(key:string):any
    {
        return nconf.get(key);
    }
}
export = Config