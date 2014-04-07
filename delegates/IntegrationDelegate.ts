///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import q                                        = require('q');
import log4js                                   = require('log4js');
import BaseDaoDelegate                          = require('./BaseDaoDelegate');
import IDao                                     = require('../dao/IDao');
import IntegrationDAO                           = require('../dao/IntegrationDao');
import Integration                              = require('../models/Integration');
import Utils                                    = require('../common/Utils');

/*
 * Delegate class for third party integration data
 */
class IntegrationDelegate extends BaseDaoDelegate
{
    private static cachedIntegrations:{[id:number]:Integration} = {};

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        IntegrationDelegate.updateCache();
    })();

    private static updateCache()
    {
        var integrationDao:any = new IntegrationDAO();
        return integrationDao.getAll()
            .then(
            function integrationsFetched(integrations)
            {
                _.each(integrations, function(i) {
                    var integration = new Integration(i);
                    IntegrationDelegate.cachedIntegrations[integration.getId()] = integration;
                });
                log4js.getDefaultLogger().info(integrations.length + ' integrations fetched and cached');
            },
            function integrationsFetchError(err)
            {
                log4js.getDefaultLogger().debug('Error fetching list of integrations from services, error: ' + err);
            });
    }

    getAll():Integration[]
    {
        return _.values(IntegrationDelegate.cachedIntegrations);
    }

    getSync(id:number):Integration
    {
        try {
            id = parseInt(id.toString());
        } catch (e) {}
        return IntegrationDelegate.cachedIntegrations[id];
    }

    resetSecret(integrationId:string):q.Promise<any>
    {
        var newSecret = Utils.getRandomString(30);
        return this.dao.update({'integration_id': integrationId}, {'secret': newSecret})
            .then(
            function handleSecretReset() { return newSecret; }
        );
    }

    constructor() { super(new IntegrationDAO()); }

}
export = IntegrationDelegate