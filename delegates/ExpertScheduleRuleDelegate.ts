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

        create(scheduleRule:models.ExpertScheduleRule, transaction?:any):Q.Promise<any>
        {
            var expertScheduleRuleDao:any = this.getDao();
            var self = this;

            return expertScheduleRuleDao.findConflictingScheduleRules(scheduleRule.getRepeatStart(), scheduleRule.getRepeatEnd(), scheduleRule.getIntegrationMemberId())
                .then(
                function schedulesSearched(scheduleRules:Array<models.ExpertScheduleRule>)
                {
                    if (scheduleRules.length != 0)
                        return self.getDao().create(scheduleRule, transaction);
                    else
                        throw {
                            'message': 'Conflicting schedule rules found',
                            'conflicts': scheduleRules
                        };
                });
        }

        getRulesByIntegrationMemberId(integrationMemberId:number):Q.Promise<any>
        {
            return this.getDao().search({'integration_member_id': integrationMemberId});
        }

    }
}