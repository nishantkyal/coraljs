///<reference path='../_references.d.ts'/>
import Coral                                                    = require('Coral');
import log4js                                                   = require('log4js');
import IntegrationDelegate                                      = require('../delegates/IntegrationDelegate');

class IntegrationCache
{
    static integrations:Object = {};

    /** Static constructor workaround */
    static update()
    {
        new IntegrationDelegate().getAll()
            .then(
            function integrationsFetched(integrations)
            {
                for (var i = 0; i < integrations.length; i++)
                {
                    var integration = integrations[i];
                    IntegrationCache.integrations[integration.getId()] = integration;
                }
                log4js.getDefaultLogger().info(integrations.length + ' integrations fetched and cached');
            },
            function integrationsFetchError(err)
            {
                log4js.getDefaultLogger().debug('Error fetching list of integrations from services, error: ' + err);
            });
    }

    get(id?:number):Coral.Integration
    {
        if (id)
            return IntegrationCache.integrations[id];
        return null;
    }

}
export = IntegrationCache