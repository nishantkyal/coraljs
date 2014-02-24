///<reference path='../_references.d.ts'/>
import express                          = require('express');
import ApiConstants                     = require('../enums/ApiConstants');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import ExpertScheduleRuleDelegate       = require('../delegates/ExpertScheduleRuleDelegate');
import ExpertScheduleExceptionDelegate  = require('../delegates/ExpertScheduleExceptionDelegate');
import AccessControl                    = require('../middleware/AccessControl');
import IntegrationMember                = require('../models/IntegrationMember');
import ExpertScheduleRule               = require('../models/ExpertScheduleRule');
import ExpertScheduleException          = require('../models/ExpertScheduleException');

/*
 Rest Calls for expert schedule rules
 **/
class ExpertScheduleRulesApi
{
    constructor(app)
    {
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();
        var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();

        app.put(ApiUrlDelegate.scheduleRuleByExpert(), function (req:express.Request, res:express.Response)
        {
            var expertId = req.params[ApiConstants.EXPERT_ID];
            var scheduleRule:ExpertScheduleRule = req.body[ApiConstants.SCHEDULE_RULE];

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
                .then
            (
                function expertScheduleGenerator(schedules)
                {
                    res.json(schedules);

                    /*var options = {
                        startDate: new Date(parseInt(req.query[ApiConstants.START_TIME])),
                        endDate: new Date(parseInt(req.query[ApiConstants.END_TIME]))
                    };
                    expertScheduleExceptionDelegate.getExceptionsByIntegrationMemberId(expertId)
                        .then(
                        function (exceptions:ExpertScheduleException[])
                        {
                            var generatedSchedules = expertScheduleRuleDelegate.expertScheduleGenerator(schedules, exceptions, options);
                            res.json(generatedSchedules);
                        }
                    )*/
                },
                function expertScheduleRuleCreateFailed(error) {res.status(500).json(error); }
            )
        });

        app.post(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            var scheduleRule:ExpertScheduleRule = req.body[ApiConstants.SCHEDULE_RULE];
            scheduleRule.setId(scheduleRuleId);
            scheduleRule.setIntegrationMemberId(expertId);

            expertScheduleRuleDelegate.updateRule(scheduleRule)
                .then
            (
                function updateScheduleRule(rule:ExpertScheduleException){res.json(rule);},
                function updateScheduleRuleError(error){res.status(500).json(error)}
            )
        });

        app.delete(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId = req.params[ApiConstants.SCHEDULE_RULE_ID]; //pass as string not number
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            expertScheduleRuleDelegate.deleteRule(scheduleRuleId)
                .then
            (
                function updateScheduleRule(rule:ExpertScheduleException){res.json(rule);},
                function updateScheduleRuleError(error){res.status(500).json(error)}
            )
        });
    }

}
export = ExpertScheduleRulesApi