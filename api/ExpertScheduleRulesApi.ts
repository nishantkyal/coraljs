///<reference path='../_references.d.ts'/>
import express                      = require('express');
import ApiConstants                 = require('../enums/ApiConstants');
import ApiUrlDelegate               = require('../delegates/ApiUrlDelegate');
import ExpertScheduleRuleDelegate   = require('../delegates/ExpertScheduleRuleDelegate');
import AccessControl                = require('../middleware/AccessControl');
import IntegrationMember            = require('../models/IntegrationMember');
import ExpertScheduleRule           = require('../models/ExpertScheduleRule');

/*
 Rest Calls for expert schedule rules
 **/
class ExpertScheduleRulesApi
{
    constructor(app)
    {
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();

        app.put(ApiUrlDelegate.scheduleRuleByExpert(), function (req:express.Request, res:express.Response)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            var scheduleRule = new ExpertScheduleRule();
            scheduleRule.setCronRule(req.query[ApiConstants.SCHEDULE_RULE]);
            scheduleRule.setIntegrationMemberId(expertId);
            scheduleRule.setDuration(req.query[ApiConstants.DURATION]);
            scheduleRule.setRepeatStart(req.query[ApiConstants.START_TIME]);
            scheduleRule.setRepeatEnd(req.query[ApiConstants.END_TIME]);
            //TODO How to create scheduleRule Object automatically
            //TODO generate rule ID and ID
            expertScheduleRuleDelegate.create(scheduleRule)
                .then(
                function expertScheduleRuleCreated(schedule) { res.json(schedule); },
                function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
            )
        });

        app.get(ApiUrlDelegate.scheduleRuleByExpert(), function (req:express.Request, res:express.Response)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            expertScheduleRuleDelegate.getRulesByIntegrationMemberId(expertId)
                .then(
                function expertScheduleGenerator(schedules)
                {
                    var options = {
                        startDate: new Date(parseInt(req.query[ApiConstants.START_TIME])),
                        endDate: new Date(parseInt(req.query[ApiConstants.END_TIME]))
                    };
                    var generatedSchedules = expertScheduleRuleDelegate.expertScheduleGenerator(schedules,options);
                    res.json(generatedSchedules);
                },
                function expertScheduleRuleCreateFailed(error) {res.status(500).json(error); }
            )
        });

        app.post(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId:string = req.params[ApiConstants.SCHEDULE_RULE_ID];
            var scheduleRule:ExpertScheduleRule = req[ApiConstants.SCHEDULE_RULE];

            expertScheduleRuleDelegate.update({'schedule_id': scheduleRuleId}, scheduleRule)
                .then(
                function expertScheduleRuleUpdated(schedule) { res.json(schedule); },
                function expertScheduleRuleUpdateFailed(error) { res.status(500).json(error); }
            )
        });
        app.delete(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {

        });
    }

}
export = ExpertScheduleRulesApi