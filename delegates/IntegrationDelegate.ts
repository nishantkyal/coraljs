///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import q                                        = require('q');
import log4js                                   = require('log4js');
import BaseDaoDelegate                          = require('./BaseDaoDelegate');
import MysqlDelegate                            = require('./MysqlDelegate');
import IDao                                     = require('../dao/IDao');
import IntegrationDAO                           = require('../dao/IntegrationDao');
import Integration                              = require('../models/Integration');
import IntegrationMember                        = require('../models/IntegrationMember');
import User                                     = require('../models/User');
import Utils                                    = require('../common/Utils');
import IntegrationMemberRole                    = require('../enums/IntegrationMemberRole');
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

    createByUser(object:any, user?:User, transaction?:any):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        return this.create(object, transaction)
            .then(
            function integrationCreated(integration:Integration)
            {
                var member = new IntegrationMember();
                member.setIntegrationId(integration.getId());
                member.setRole(IntegrationMemberRole.Owner);
                member.setUserId(user.getId())


                var IntegrationMemberDelegate:any = require('./IntegrationMemberDelegate');
                var integrationMemberDelegate = new IntegrationMemberDelegate();
                return integrationMemberDelegate.create(member, transaction);
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