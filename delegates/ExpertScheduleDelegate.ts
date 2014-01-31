///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='./UserDelegate.ts'/>
///<reference path='./ExpertScheduleRuleDelegate.ts'/>
///<reference path='./MysqlDelegate.ts'/>
///<reference path='../dao/ExpertScheduleDao.ts'/>
///<reference path='../models/ExpertSchedule.ts'/>
///<reference path='../models/ExpertScheduleRule.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../enums/ApiFlags.ts'/>

/**
 * Delegate class for expert schedules
 */
module delegates
{
    export class ExpertScheduleDelegate extends BaseDaoDelegate
    {
        getDao():dao.IDao { return new dao.ExpertScheduleDao(); }

        /* Get schedules for expert */
        getSchedulesForExpert(expertId:number, startTime?:number, endTime?:number):Q.IPromise<any>
        {
            var that = this;
            var schedules = [];

            var isStartTimeEmpty = common.Utils.isNullOrEmpty(startTime);
            var isEndTimeEmpty = common.Utils.isNullOrEmpty(endTime);
            var maxAllowedInterval = 604800000; // millis in a week

            if (isStartTimeEmpty && isEndTimeEmpty)
            {
                var today = new Date();
                startTime = today.getTime();
                endTime = startTime + maxAllowedInterval;
            } else if (isStartTimeEmpty)
                startTime = endTime - maxAllowedInterval;
            else if (isEndTimeEmpty)
                endTime = startTime + maxAllowedInterval;

            // 1. Search schedules
            // 2. If no schedules, try creating them based on defined rules for the period (if defined)
            return that.getDao().search(
                {
                    'integration_member_id': expertId,
                    'start_time': {
                        'operator': 'BETWEEN',
                        'value': [startTime, endTime]
                    }
                })
                .then(
                function schedulesSearched(s:Array)
                {
                    schedules = s;
                    if (schedules.length == 0 && startTime && endTime)
                        return that.createSchedulesForExpert(expertId, startTime, endTime);
                    else
                        return schedules;
                });

        }

        /* Create new schedule */
        create(object:Object, transaction?:any):Q.IPromise<any>
        {
            var s = super;
            var that = this;

            // Don't create if schedule with same details already exists
            return this.search(object)
                .then(
                function handleScheduleSearched(schedules:Array)
                {
                    if (schedules.length == 0)
                        return s.create.call(that, object, transaction);
                    else
                        throw('Schedule already exists with the same details');
                }
            )
        }

        createSchedulesForExpert(integrationMemberId:number, startTime:number, endTime:number):Q.IPromise<any>
        {
            var rules = [];
            var transaction;
            var schedules = [];
            var that = this;

            return new ExpertScheduleRuleDelegate().getRulesByIntegrationMemberId(integrationMemberId)
                .then(
                function rulesSearched(rs:Array)
                {
                    rules = rs;
                    if (rs.length != 0)
                        return delegates.MysqlDelegate.beginTransaction()
                            .then(
                            function transactionStarted(t)
                            {
                                transaction = t;
                                _.each(rules, function (rule)
                                {
                                    schedules = schedules.concat(that.generateSchedules(new models.ExpertScheduleRule(rule), integrationMemberId, startTime, endTime));
                                });

                                return q.all(_.map(schedules, function (schedule)
                                {
                                    return that.create(schedule, transaction);
                                }));
                            })
                            .then(
                            function schedulesCreated()
                            {
                                return delegates.MysqlDelegate.commit(transaction, schedules);
                            });
                    else
                        return schedules;
                });
        }

        /* Helper method to generate schedules based on a given rule for an interval */
        generateSchedules(rule:models.ExpertScheduleRule, integrationMemberId:number, startTime:number, endTime:number):models.ExpertSchedule[]
        {
            var invalidData:boolean = !startTime || !endTime || !rule || !rule.isValid();
            var outOfRange:boolean = rule.getRepeatEnd() <= startTime || rule.getRepeatStart() >= endTime;
            var schedules = [];

            if (invalidData || outOfRange)
            {
                this.logger.error('Invalid data specified for generating schedules');
                return schedules;
            }

            if (rule.getRepeatCron())
            {
            }
            else if (rule.getRepeatInterval())
            {
                if (rule.getRepeatEnd())
                    endTime = Math.min(endTime, rule.getRepeatEnd());
                startTime = Math.max(startTime, rule.getRepeatStart());

                for (var i = startTime; i <= endTime; i += rule.getRepeatInterval())
                {
                    var eSchedule = new models.ExpertSchedule();
                    eSchedule.setPricePerMin(rule.getPricePerMin());
                    eSchedule.setPriceUnit(rule.getPriceUnit());
                    eSchedule.setDuration(rule.getDuration());
                    eSchedule.setStartTime(i);
                    eSchedule.setIntegrationMemberId(integrationMemberId);
                    eSchedule.setScheduleRuleId(rule.getId());
                    schedules.push(eSchedule);
                }
            }

            return schedules;
        }

        getIncludeHandler(include:string, result:Object):Q.IPromise<any>
        {
            var userDelegate = new UserDelegate();
            var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
            var integrationMemberDelegate = new IntegrationMemberDelegate();
            var integrationMemberId = result['integration_member_id'];

            switch (include)
            {
                case enums.ApiFlags.INCLUDE_USER:
                    return integrationMemberDelegate.get(integrationMemberId)
                        .then(
                        function scheduleExpertFetched(expert) { return userDelegate.get(expert.user_id); }
                    );
                case enums.ApiFlags.INCLUDE_INTEGRATION_MEMBER:
                    return integrationMemberDelegate.get(integrationMemberId);
            }

            return super.getIncludeHandler(include, result);
        }

    }
}