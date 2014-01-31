///<reference path='../_references.d.ts'/>

/**
 * Utility class for accessing global app config
 * Read from specified file
 */
module common
{
    export class Config
    {
        /** Static constructor workaround */
        private static ctor = (() =>
        {
            nconf.file({file: "/var/searchntalk/config/config.json"});
        })();

        /** Getters */
        static get(key:string):any
        {
            return nconf.get(key);
        }
    }
}
