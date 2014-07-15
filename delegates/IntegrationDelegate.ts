///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import q                                        = require('q');
import log4js                                   = require('log4js');
import BaseDaoDelegate                          = require('./BaseDaoDelegate');
import MysqlDelegate                            = require('./MysqlDelegate');
import ImageDelegate                            = require('../delegates/ImageDelegate');
import IntegrationDAO                           = require('../dao/IntegrationDao');
import Integration                              = require('../models/Integration');
import IntegrationMember                        = require('../models/IntegrationMember');
import User                                     = require('../models/User');
import Utils                                    = require('../common/Utils');
import Config                                   = require('../common/Config');
import IntegrationMemberRole                    = require('../enums/IntegrationMemberRole');
import ImageSize                                = require('../enums/ImageSize');

/*
 * Delegate class for third party integration data
 */
class IntegrationDelegate extends BaseDaoDelegate
{
    private static cachedIntegrations:{[id:number]:Integration} = {};
    private imageDelegate = new ImageDelegate();

    updateCache():q.Promise<any>
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
                log4js.getLogger('IntegrationDelegate').info(integrations.length + ' integrations fetched and cached');
            },
            function integrationsFetchError(err)
            {
                log4js.getLogger('IntegrationDelegate').fatal('Error fetching list of integrations from services, error: ' + err);
            });
    }

    create(object:any, transaction?:Object):q.Promise<any>
    {
        object[Integration.SECRET] = object[Integration.SECRET] || Utils.getRandomString(20);
        return super.create(object, transaction);
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

    processLogoImage(integrationId:number, tempImagePath:string):q.Promise<any>
    {
        var self = this;
        var imageBasePath:string = Config.get(Config.LOGO_PATH) + integrationId;
        var sizes = [ImageSize.LARGE, ImageSize.MEDIUM, ImageSize.SMALL];

        return q.all(_.map(sizes, function (size:ImageSize):q.Promise<any>
        {
            return self.imageDelegate.resize(tempImagePath, imageBasePath + '_' + ImageSize[size].toLowerCase(), size);
        }))
            .then( function imagesResized(){
                return self.imageDelegate.delete(tempImagePath);
            })
            .fail( function imageResizeFailed(error)
            {
                self.logger.debug('Image resize failed because %s', error);
            });
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