///<reference path='../_references.d.ts'/>
import q                = require('q');
import BaseDaoDelegate  = require('./BaseDaoDelegate');
import IDao             = require('../dao/IDao');
import IntegrationDAO   = require('../dao/IntegrationDao');
import Integration      = require('../models/Integration');
import Utils            = require('../common/Utils');

/**
 * Delegate class for third party integration data
 */
class IntegrationDelegate extends BaseDaoDelegate
{
    getAll():q.Promise<any>
    {
        var integrationDao:any = this.getDao();
        return integrationDao.getAll();
    }

    resetSecret(integrationId:string):q.Promise<any>
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