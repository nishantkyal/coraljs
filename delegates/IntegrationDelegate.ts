import q                = require('q');
import BaseDaoDelegate  = require('./BaseDaoDelegate');
import IDao             = require('../dao/IDao');
import IntegrationDAO   = require('../dao/IntegrationDao');
import Integration      = require('../models/Integration');
import Utils            = require('../Utils');

/**
 * Delegate class for third party integration data
 */
class IntegrationDelegate extends BaseDaoDelegate
{
    get(id:string, fields?:string[]):q.makePromise
    {
        return super.get(id, fields)
            .then(function integrationFetched(result:Object)
            {
                return new Integration(result);
            });
    }

    getAll():q.makePromise
    {
        return IntegrationDAO.getAll();
    }

    getMultiple(ids:string[]):q.makePromise
    {
        return this.getDao().search({'integration_id': ids});
    }

    resetSecret(integrationId:string):q.makePromise
    {
        var newSecret = Utils.getRandomString(30);
        return this.getDao().update({'integration_id': integrationId}, {'secret': newSecret})
            .then(
                function handleSecretReset() { return newSecret; }
            );
    }

    getDao():IDao { return new IntegrationDAO(); }

}
export = IntegrationDelegate