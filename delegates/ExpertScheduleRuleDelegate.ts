///<reference path='../_references.d.ts'/>
///<reference path='./BaseDaoDelegate.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/ExpertScheduleRuleDao.ts'/>
///<reference path='../models/ExpertScheduleRule.ts'/>
///<reference path='../delegates/IntegrationMemberDelegate.ts'/>

module delegates
{
    export class ExpertScheduleRuleDelegate extends BaseDaoDelegate
    {
        getDao():dao.IDao { return new dao.ExpertScheduleRuleDao(); }

        create(scheduleRule:models.ExpertScheduleRule, transaction?:any):Q.IPromise<any>
        {
            var s = super;

            var expertScheduleRuleDao:any = this.getDao();

            return expertScheduleRuleDao.findConflictingScheduleRules(scheduleRule.getRepeatStart(), scheduleRule.getRepeatEnd(), scheduleRule.getIntegrationMemberId())
                .then(
                function schedulesSearched(schedules:Array)
                {
                    if (schedules.length != 0)
                        return s.create(scheduleRule, transaction);
                    else
                        throw {
                            'message': 'Conflicting schedule rules found',
                            'conflicts': schedules
                        };
                });
        }

        getRulesByIntegrationMemberId(integrationMemberId:number):Q.IPromise<any>
        {
            return this.getDao().search({'integration_member_id': integrationMemberId});
        }

    }
}