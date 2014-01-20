import q                            = require('q');
import _                            = require('underscore');
import BaseDaoDelegate              = require('BaseDaoDelegate');
import Utils                        = require('../Utils');
import MysqlDelegate                = require('../delegates/MysqlDelegate');
import IntegrationDelegate          = require('../delegates/IntegrationDelegate');
import UserDelegate                 = require('../delegates/UserDelegate');
import IDao                         = require ('../dao/IDao');
import IntegrationMemberDAO         = require ('../dao/IntegrationMemberDao');
import IntegrationMemberRole        = require('../enums/IntegrationMemberRole');
import ApiFlags                     = require('../enums/ApiFlags');
import IntegrationMember            = require('../models/IntegrationMember');
import AccessTokenCache             = require('../caches/AccessTokenCache');

class IntegrationMemberDelegate extends BaseDaoDelegate
{
    create(object:Object, transaction?:any):q.makePromise
    {
        var integrationMember = new IntegrationMember(object);
        integrationMember.setAuthCode(Utils.getRandomString(30));

        return super.create(integrationMember, transaction);
    }

    get(id:any, fields?:string[], flags?:string[]):q.makePromise
    {
        fields = fields || ['id', 'role', 'integration_id', 'user_id'];
        return super.get(id, fields, flags);
    }

    getIntegrationsForUser(user_id:string, fields?:string[]):q.makePromise
    {
        var integrationFields:string[] = _.map(fields, function appendTableName(field)
        {
            return 'integration.' + field;
        });

        var query:string = 'SELECT ? ' +
            'FROM integration, integration_member ' +
            'WHERE integration_member.user_id = ? ' +
            'AND integration.id = integration_member.integration_id';
        return MysqlDelegate.executeQuery(query, [integrationFields.join(','), user_id]);
    }

    findValidAccessToken(accessToken:string, integrationMemberId?:string):q.makePromise
    {
        var accessTokenCache = new AccessTokenCache();
        var that = this;

        function tokenFetched(result)
        {
            if (_.isArray(result)) result = result[0];

            if (result && (!integrationMemberId || result['integration_member_id'] === integrationMemberId))
                return new IntegrationMember(result);

            return null;
        }

        return accessTokenCache.getAccessTokenDetails(accessToken)
            .then(
            tokenFetched,
            function tokenFromCacheError(error)
            {
                // Try fetching from database
                that.logger.debug("Couldn't get token details from cache, hitting db, Error: " + error);
                return that.search({'access_token': accessToken}, [])
                    .then(tokenFetched)
            }
        );
    }

    updateById(id:string, integrationMember:IntegrationMember):q.makePromise
    {
        return this.update({'integration_member_id': id}, integrationMember);
    }

    getDao():IDao { return new IntegrationMemberDAO(); }

    getIncludeHandler(include:string, result:any):q.makePromise
    {
        switch (include)
        {
            case ApiFlags.INCLUDE_INTEGRATION:
                return new IntegrationDelegate().get(result['id']);
            case ApiFlags.INCLUDE_USER:
                return new UserDelegate().get(result['user_id']);
        }
        return super.getIncludeHandler(include, result);
    }
}
export = IntegrationMemberDelegate