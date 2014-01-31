///<reference path='../_references.d.ts'/>
///<reference path='../delegates/ExpertScheduleDelegate.ts'/>
///<reference path='../delegates/ApiUrlDelegate.ts'/>
///<reference path='../api/ApiConstants.ts'/>
///<reference path='../models/ExpertScheduleRule.ts'/>

/*
 Rest Calls for expert schedule rules
 **/
module api
{
    export class ExpertScheduleRulesApi
    {
        constructor(app)
        {
            var expertScheduleRuleDelegate = new delegates.ExpertScheduleRuleDelegate();

            app.put(delegates.ApiUrlDelegate.scheduleRuleByExpert(), function (req, res)
            {
                var expertId = req.params[ApiConstants.EXPERT_ID];
                var scheduleRule:models.ExpertScheduleRule = req[ApiConstants.SCHEDULE_RULE];
                scheduleRule.setIntegrationMemberId(expertId);

                expertScheduleRuleDelegate.create(scheduleRule)
                    .then(
                    function expertScheduleRuleCreated(schedule) { res.json(schedule); },
                    function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
                )
            });

            app.get(delegates.ApiUrlDelegate.scheduleRuleByExpert(), function (req, res)
            {
                var expertId = req.params[ApiConstants.EXPERT_ID];

                expertScheduleRuleDelegate.getRulesByIntegrationMemberId(expertId)
                    .then(
                    function expertScheduleRuleCreated(schedules) { res.json(schedules); },
                    function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
                )
            });

            app.post(delegates.ApiUrlDelegate.scheduleRuleById(), function (req, res)
            {
                var scheduleRuleId:string = req.params[ApiConstants.SCHEDULE_RULE_ID];
                var scheduleRule:models.ExpertScheduleRule = req[ApiConstants.SCHEDULE_RULE];

                expertScheduleRuleDelegate.update({'schedule_id': scheduleRuleId}, scheduleRule)
                    .then(
                    function expertScheduleRuleUpdated(schedule) { res.json(schedule); },
                    function expertScheduleRuleUpdateFailed(error) { res.status(500).json(error); }
                )
            });

        }

    }
}