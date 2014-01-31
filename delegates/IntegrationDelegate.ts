///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/IntegrationDao.ts'/>
///<reference path='../models/Integration.ts'/>
///<reference path='../common/Utils.ts'/>

/**
 * Delegate class for third party integration data
 */
module delegates
{
    export class IntegrationDelegate extends BaseDaoDelegate
    {
        get(id:string, fields?:string[]):Q.IPromise<any>
        {
            return super.get(id, fields)
                .then(function integrationFetched(result:Object)
                {
                    return new models.Integration(result);
                });
        }

        getAll():Q.IPromise<any>
        {
            return dao.IntegrationDao.getAll();
        }

        getMultiple(ids:string[]):Q.IPromise<any>
        {
            return this.getDao().search({'integration_id': ids});
        }

        resetSecret(integrationId:string):Q.IPromise<any>
        {
            var newSecret = common.Utils.getRandomString(30);
            return this.getDao().update({'integration_id': integrationId}, {'secret': newSecret})
                .then(
                    function handleSecretReset() { return newSecret; }
                );
        }

        getDao():dao.IDao { return new dao.IntegrationDao(); }

    }
}