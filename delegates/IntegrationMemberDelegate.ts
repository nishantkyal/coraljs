///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import Utils                        = require('../common/Utils');
import BaseDaoDelegate              = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                = require('../delegates/MysqlDelegate');
import IntegrationDelegate          = require('../delegates/IntegrationDelegate');
import UserDelegate                 = require('../delegates/UserDelegate');
import ExpertScheduleDelegate       = require('../delegates/ExpertScheduleDelegate');
import IDao                         = require ('../dao/IDao');
import IntegrationMemberDAO         = require ('../dao/IntegrationMemberDao');
import IntegrationMemberRole        = require('../enums/IntegrationMemberRole');
import IncludeFlag                  = require('../enums/IncludeFlag');
import Integration                  = require('../models/Integration');
import IntegrationMember            = require('../models/IntegrationMember');
import AccessTokenCache             = require('../caches/AccessTokenCache');

class IntegrationMemberDelegate extends BaseDaoDelegate
{
    create(object:Object, transaction?:any):q.Promise<any>
    {
        var integrationMember = new IntegrationMember(object);
        integrationMember.setAuthCode(Utils.getRandomString(30));

        return super.create(integrationMember, transaction);
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
        return this.search(search, {'fields': fields}, includes);
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

    updateById(id:string, integrationMember:IntegrationMember):q.Promise<any>
    {
        return this.update({'integration_member_id': id}, integrationMember);
    }

    getDao():IDao { return new IntegrationMemberDAO(); }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION:
                return new IntegrationDelegate().get(_.uniq(_.pluck(result, IntegrationMember.INTEGRATION_ID)));
            case IncludeFlag.INCLUDE_USER:
                return new UserDelegate().get(_.uniq(_.pluck(result, IntegrationMember.USER_ID)));
            case IncludeFlag.INCLUDE_SCHEDULES:
                return new ExpertScheduleDelegate().getSchedulesForExpert(_.uniq(_.pluck(result, IntegrationMember.ID)));
        }
        return super.getIncludeHandler(include, result);
    }
}
export = IntegrationMemberDelegate