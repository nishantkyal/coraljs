///<reference path='../_references.d.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../delegates/BaseDaoDelegate.ts'/>
///<reference path='../delegates/MysqlDelegate.ts'/>
///<reference path='../delegates/IntegrationDelegate.ts'/>
///<reference path='../delegates/UserDelegate.ts'/>
///<reference path='../delegates/ExpertScheduleDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/IntegrationMemberDao.ts'/>
///<reference path='../enums/IntegrationMemberRole.ts'/>
///<reference path='../enums/ApiFlags.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../caches/AccessTokenCache.ts'/>

module delegates
{
    export class IntegrationMemberDelegate extends BaseDaoDelegate
    {
        create(object:Object, transaction?:any):Q.IPromise<any>
        {
            var integrationMember = new models.IntegrationMember(object);
            integrationMember.setAuthCode(common.Utils.getRandomString(30));

            return super.create(integrationMember, transaction);
        }

        get(id:any, fields?:string[], flags?:string[]):Q.IPromise<any>
        {
            fields = fields || ['id', 'role', 'integration_id', 'user_id'];
            return super.get(id, fields, flags);
        }

        getIntegrationsForUser(user_id:string, fields?:string[]):Q.IPromise<any>
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

        findValidAccessToken(accessToken:string, integrationMemberId?:string):Q.IPromise<any>
        {
            var accessTokenCache = new caches.AccessTokenCache();
            var that = this;

            function tokenFetched(result)
            {
                if (_.isArray(result)) result = result[0];

                if (result && (!integrationMemberId || result['integration_member_id'] === integrationMemberId))
                    return new models.IntegrationMember(result);

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

        updateById(id:string, integrationMember:models.IntegrationMember):Q.IPromise<any>
        {
            return this.update({'integration_member_id': id}, integrationMember);
        }

        getDao():dao.IDao { return new dao.IntegrationMemberDao(); }

        getIncludeHandler(include:string, result:any):Q.IPromise<any>
        {
            switch (include)
            {
                case enums.ApiFlags.INCLUDE_INTEGRATION:
                    return new IntegrationDelegate().get(result['id']);
                case enums.ApiFlags.INCLUDE_USER:
                    return new UserDelegate().get(result['user_id']);
                case enums.ApiFlags.INCLUDE_SCHEDULES:
                    return new ExpertScheduleDelegate().getSchedulesForExpert(result['id']);
            }
            return super.getIncludeHandler(include, result);
        }
    }
}