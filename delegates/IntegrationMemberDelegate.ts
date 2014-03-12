///<reference path='../_references.d.ts'/>
import _                                    = require('underscore');
import q                                    = require('q');
import Utils                                = require('../common/Utils');
import BaseDaoDelegate                      = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                        = require('../delegates/MysqlDelegate');
import ExpertScheduleDelegate               = require('../delegates/ExpertScheduleDelegate');
import IntegrationDelegate                  = require('../delegates/IntegrationDelegate');
import UserDelegate                         = require('../delegates/UserDelegate');
import UserProfileDelegate                  = require('../delegates/UserProfileDelegate');
import IDao                                 = require ('../dao/IDao');
import IntegrationMemberDAO                 = require ('../dao/IntegrationMemberDao');
import IntegrationMemberRole                = require('../enums/IntegrationMemberRole');
import IncludeFlag                          = require('../enums/IncludeFlag');
import Integration                          = require('../models/Integration');
import User                                 = require('../models/User');
import IntegrationMember                    = require('../models/IntegrationMember');
import AccessTokenCache                     = require('../caches/AccessTokenCache');
import ExpertScheduleRuleDelegate           = require('../delegates/ExpertScheduleRuleDelegate');

class IntegrationMemberDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [IntegrationMember.ID, IntegrationMember.INTEGRATION_ID, IntegrationMember.ROLE];
    DASHBOARD_FIELDS:string[] = [IntegrationMember.ID, IntegrationMember.INTEGRATION_ID, IntegrationMember.ROLE, IntegrationMember.USER_ID, IntegrationMember.REVENUE_SHARE, IntegrationMember.REVENUE_SHARE_UNIT];

    create(object:Object, transaction?:any):q.Promise<any>
    {
        var integrationMember = new IntegrationMember(object);
        integrationMember.setAuthCode(Utils.getRandomString(30));
        var superCreate = super.create;
        var self = this;
        var createdExpert;
        var transaction;

        return MysqlDelegate.beginTransaction()
            .then(
            function createUserAfterTransactionStarted(t)
            {
                transaction = t;
                return superCreate.call(self, integrationMember, transaction);
            })
            .then(
            function commitTransaction(expert)
            {
                createdExpert = expert;
                return MysqlDelegate.commit(transaction, createdExpert);
            })
            .then(
            function createDefaultScheduleRules()
            {
                // TODO: Execute this in transaction. Figure out why lock times out when creating rule in same transaction
                return new ExpertScheduleRuleDelegate().createDefaultRules(createdExpert.getId(), transaction);
            })
            .then(
            function rulesCreated()
            {
                return self.get(createdExpert.getId(), [IntegrationMember.AUTH_CODE, IntegrationMember.ID, IntegrationMember.INTEGRATION_ID, IntegrationMember.USER_ID]);
            });
    }

    get(id:any, fields?:string[], flags:Array<IncludeFlag> = []):q.Promise<any>
    {
        fields = fields || ['id', 'role', 'integration_id', 'user_id'];
        return super.get(id, fields, flags);
    }

    searchByUser(user_id:number, fields?:string[], includes:Array<IncludeFlag> = []):q.Promise<any>
    {
        var search = {};
        search[IntegrationMember.USER_ID] = user_id;

        fields = fields || ['id', 'role', 'integration_id', 'user_id'];
        return this.search(search, null, fields, includes);
    }

    findValidAccessToken(accessToken:string, integrationMemberId?:string):q.Promise<any>
    {
        var accessTokenCache = new AccessTokenCache();
        var self = this;

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
                self.logger.debug("Couldn't get token details from cache, hitting db, Error: " + error);
                return self.search({'access_token': accessToken}, [])
                    .then(tokenFetched)
            }
        );
    }

    updateById(id:number, integrationMember:IntegrationMember):q.Promise<any>
    {
        return this.update({'id': id}, integrationMember);
    }

    findByEmail(email:string):q.Promise<IntegrationMember>
    {
        var query = 'SELECT im.* ' +
            'FROM integration_member im, user u ' +
            'WHERE im.user_id = u.id ' +
            'AND u.email = ? ' +
            'LIMIT 1';
        return MysqlDelegate.executeQuery(query, [email])
            .then(
                function membersFound(members)
                {
                    return new IntegrationMember(members[0]);
                });
    }

    getDao():IDao { return new IntegrationMemberDAO(); }


    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        result = [].concat(result);

        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION:
                return new IntegrationDelegate().get(_.uniq(_.pluck(result, IntegrationMember.INTEGRATION_ID)));
            case IncludeFlag.INCLUDE_USER:
                return new UserDelegate().get(_.uniq(_.pluck(result, IntegrationMember.USER_ID)));
            case IncludeFlag.INCLUDE_USER_PROFILE:
                return new UserProfileDelegate().search({'user_id': _.uniq(_.pluck(result, IntegrationMember.USER_ID))});
            case IncludeFlag.INCLUDE_SCHEDULES:
                return new ExpertScheduleDelegate().getSchedulesForExpert(result[0][IntegrationMember.ID]);
            case IncludeFlag.INCLUDE_SCHEDULE_RULES:
                return new ExpertScheduleRuleDelegate().getRulesByIntegrationMemberId(result[0][IntegrationMember.ID]);
        }
        return super.getIncludeHandler(include, result);
    }
}
export = IntegrationMemberDelegate