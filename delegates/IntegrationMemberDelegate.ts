import _                                            = require('underscore');
import q                                            = require('q');
import moment                                       = require('moment');
import Utils                                        = require('../common/Utils');
import BaseDaoDelegate                              = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                = require('../delegates/MysqlDelegate');
import ExpertScheduleDelegate                       = require('../delegates/ExpertScheduleDelegate');
import IntegrationDelegate                          = require('../delegates/IntegrationDelegate');
import ExpertScheduleRuleDelegate                   = require('../delegates/ExpertScheduleRuleDelegate');
import IntegrationMemberDAO                         = require ('../dao/IntegrationMemberDao');
import IntegrationMemberRole                        = require('../enums/IntegrationMemberRole');
import IncludeFlag                                  = require('../enums/IncludeFlag');
import ProfileStatus                                = require('../enums/ProfileStatus');
import Integration                                  = require('../models/Integration');
import User                                         = require('../models/User');
import UserProfile                                  = require('../models/UserProfile');
import IntegrationMember                            = require('../models/IntegrationMember');
import AccessTokenCache                             = require('../caches/AccessTokenCache');

class IntegrationMemberDelegate extends BaseDaoDelegate
{
    private expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();
    private expertScheduleDelegate = new ExpertScheduleDelegate();
    private integrationDelegate = new IntegrationDelegate();
    private userDelegate;
    private userProfileDelegate;

    constructor()
    {
        super(new IntegrationMemberDAO());

        var UserProfileDelegate:any = require('../delegates/UserProfileDelegate');
        this.userProfileDelegate = new UserProfileDelegate();

        var UserDelegate:any = require('../delegates/UserDelegate');
        this.userDelegate = new UserDelegate();
    }

    create(object:Object, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;
        var integrationMember = new IntegrationMember(object);
        integrationMember.setAuthCode(Utils.getRandomString(30));

        // 1. Create member
        // 2. Create default schedule rules and profile
        // 3. Try fetching details from linkedin
        // Note: Not doing all this in transaction since it's a pretty long operation and lock wait times out
        //      Steps 2 and 3 are performed in their own transactions anyway
        return super.create(integrationMember, dbTransaction)
            .then(
            function expertCreated(expert:IntegrationMember)
            {
                integrationMember.setId(expert.getId());

                var userProfile:UserProfile = new UserProfile();
                userProfile.setStatus(ProfileStatus.INCOMPLETE);
                userProfile.setIntegrationMemberId(integrationMember.getId());

                return q.all([
                    self.userProfileDelegate.create(userProfile),
                    self.expertScheduleRuleDelegate.createDefaultRules(expert.getId())
                ]);
            })
            .then(
            function memberCreated(...args)
            {
                var profile:UserProfile = args[0][0];
                var profileId = profile.getId();

                return self.userProfileDelegate.fetchAllDetailsFromLinkedIn(integrationMember.getUserId(), integrationMember.getIntegrationId(), profileId)
                    .fail(
                    function linkedInFetchFailed(error)
                    {
                        self.logger.debug('LinkedIn profile fetch failed for user id: %s, error: %s', integrationMember.getUserId(), JSON.stringify(error));
                        return integrationMember;
                    });
            })
            .then(
            function profileDetailsFetched()
            {
                return integrationMember;
            });
    }

    findValidAccessToken(accessToken:string, integrationMemberId?:string, role?:IntegrationMemberRole):q.Promise<any>
    {
        var accessTokenCache = new AccessTokenCache();
        var self = this;

        function tokenFetched(result)
        {
            if (_.isArray(result)) result = result[0];

            if (result
                && (!integrationMemberId || result['integration_member_id'] === integrationMemberId)
                && (!role || result['role'] === role))
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

    findByEmail(email:string, integrationId?:number):q.Promise<IntegrationMember>
    {
        var query = 'SELECT im.* ' +
            'FROM integration_member im, user u ' +
            'WHERE im.user_id = u.id ' +
            'AND u.email = ? ';
        var values:any[] = [email];

        if (!Utils.isNullOrEmpty(integrationId))
        {
            query += ' AND integration_id = ?';
            values.push(integrationId);
        }

        query += ' LIMIT 1';

        return MysqlDelegate.executeQuery(query, values)
            .then(
            function membersFound(members)
            {
                if (!Utils.isNullOrEmpty(members))
                    return new IntegrationMember(members[0]);
                return null;
            });
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_INTEGRATION:
                return self.integrationDelegate.get(_.uniq(_.pluck(result, IntegrationMember.INTEGRATION_ID)));

            case IncludeFlag.INCLUDE_USER:
                if (Utils.getObjectType(result) == 'Array')
                    return self.userDelegate.get(_.uniq(_.pluck(result, IntegrationMember.USER_ID)));
                else
                    return self.userDelegate.get(result.getUserId());

            case IncludeFlag.INCLUDE_USER_PROFILE:
                return self.userProfileDelegate.search({'user_id': _.uniq(_.pluck(result, IntegrationMember.USER_ID))});

            case IncludeFlag.INCLUDE_SCHEDULES:
                // Return schedules for next 4 months
                var scheduleStartTime = moment().hours(0).valueOf();
                var scheduleEndTime = moment().add({months: 4}).valueOf();

                if (Utils.getObjectType(result) == 'Array')
                    return self.expertScheduleDelegate.getSchedulesForExpert(_.uniq(_.pluck(result, IntegrationMember.ID))[0], scheduleStartTime, scheduleEndTime);
                    //TODO[ankit] handle array inout in getSchedulesForExpert---> remove [0]
                else
                    return self.expertScheduleDelegate.getSchedulesForExpert(result.getId(), scheduleStartTime, scheduleEndTime)

            case IncludeFlag.INCLUDE_SCHEDULE_RULES:
                return self.expertScheduleRuleDelegate.getRulesByIntegrationMemberId(result[0][IntegrationMember.ID]);
        }
        return super.getIncludeHandler(include, result);
    }

}
export = IntegrationMemberDelegate
