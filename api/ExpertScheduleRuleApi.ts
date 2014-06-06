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
import Utils                            = require('../common/Utils');

/*
 Rest Calls for expert schedule rules
 */
class ExpertScheduleRuleApi
{
    constructor(app, secureApp)
    {
        var expertScheduleRuleDelegate = new ExpertScheduleRuleDelegate();

        app.put(ApiUrlDelegate.scheduleRule(), function (req:express.Request, res:express.Response)
        {
            var scheduleRule:ExpertScheduleRule = req.body[ApiConstants.SCHEDULE_RULE];

            if(scheduleRule.isValid())
            {
                expertScheduleRuleDelegate.create(scheduleRule)
                    .then(
                    function expertScheduleRuleCreated(schedule) { res.json(schedule.toJson()); },
                    function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
                )
            }
            else
                res.status(500).json('Invalid data');
        });

        app.get(ApiUrlDelegate.scheduleRule(), function (req:express.Request, res:express.Response)
        {
            var expertId:number = parseInt(req.query[ApiConstants.EXPERT_ID]);
            var startTime:number = parseInt(req.query[ApiConstants.START_TIME]);
            var endTime:number = parseInt(req.query[ApiConstants.END_TIME]);

            if(!Utils.isNullOrEmpty(expertId))
            {
                expertScheduleRuleDelegate.getRulesByIntegrationMemberId(expertId, startTime, endTime)
                    .then(
                    function expertScheduleGenerator(schedules) { res.json(schedules); },
                    function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
                )
            }
            else
                res.status(422).json('Fetching all values not allowed. Please specify filters');
        });

        app.get(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleId:number = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);

            expertScheduleRuleDelegate.get(scheduleId)
                .then(
                function expertScheduleRuleCreate(schedules) { res.json(schedules); },
                function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
            )
        });

        app.post(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var data:any = req.body[ApiConstants.SCHEDULE_TIMESLOTS];
            var expertId:number = parseInt(req.body[ApiConstants.EXPERT_ID]);
            var scheduleRule:ExpertScheduleRule = expertScheduleRuleDelegate.createRuleFromTimeSlots(expertId,data);
            var scheduleRuleId:number = req.params[ApiConstants.SCHEDULE_RULE_ID];
            scheduleRule.setId(scheduleRuleId);

            if(scheduleRule.isValid())
            {
                expertScheduleRuleDelegate.update(scheduleRuleId, scheduleRule)
                    .then(
                    function updateScheduleRule(rule:ExpertScheduleException) { res.json(rule); },
                    function updateScheduleRuleError(error) { res.status(500).json(error) }
                )
            }
            else
                res.status(500).json('Invalid data');
        });

        app.delete(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId:number = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);

            expertScheduleRuleDelegate.delete(scheduleRuleId)
                .then(
                function updateScheduleRule(rule:ExpertScheduleException) { res.json(rule); },
                function updateScheduleRuleError(error) { res.status(500).json(error) }
            )
        });

        app.post(ApiUrlDelegate.scheduleRule(), function (req:express.Request, res:express.Response)
        {
            var data:any = req.body[ApiConstants.SCHEDULE_TIMESLOTS];
            var expertId:number = parseInt(req.body[ApiConstants.EXPERT_ID]);
            var scheduleRule:ExpertScheduleRule = expertScheduleRuleDelegate.createRuleFromTimeSlots(expertId,data);

            expertScheduleRuleDelegate.create(scheduleRule)
                .then(
                function expertScheduleRuleCreated(schedule) { res.json(schedule.toJson()); },
                function expertScheduleRuleCreateFailed(error) { res.send(500,error); }
            )
        });
    }

}
export = ExpertScheduleRuleApi