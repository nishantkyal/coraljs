///<reference path='../_references.d.ts'/>
import express                          = require('express');
import moment                           = require('moment');
import ApiConstants                     = require('../enums/ApiConstants');
import ApiUrlDelegate                   = require('../delegates/ApiUrlDelegate');
import ScheduleRuleDelegate             = require('../delegates/ScheduleRuleDelegate');
import ScheduleExceptionDelegate        = require('../delegates/ScheduleExceptionDelegate');
import AccessControl                    = require('../middleware/AccessControl');
import IntegrationMember                = require('../models/IntegrationMember');
import ScheduleRule                     = require('../models/ScheduleRule');
import ScheduleException                = require('../models/ScheduleException');
import Utils                            = require('../common/Utils');

/*
 Rest Calls for expert schedule rules
 */
class ScheduleRuleApi
{
    constructor(app, secureApp)
    {
        var scheduleRuleDelegate = new ScheduleRuleDelegate();

        app.put(ApiUrlDelegate.scheduleRule(), function (req:express.Request, res:express.Response)
        {
            var userId:number = req[ApiConstants.USER].id;

            var scheduleRule:ScheduleRule = req.body[ApiConstants.SCHEDULE_RULE];
            scheduleRule.setRepeatStart(scheduleRule.getRepeatStart() || moment().valueOf());
            scheduleRule.setRepeatEnd(scheduleRule.getRepeatEnd() || moment().add({years: 20}).valueOf());
            scheduleRule.setUserId(userId);

            if(scheduleRule.isValid())
            {
                scheduleRuleDelegate.create(scheduleRule)
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
            var userId:number = req[ApiConstants.USER_ID].id;
            var startTime:number = parseInt(req.query[ApiConstants.START_TIME]);
            var endTime:number = parseInt(req.query[ApiConstants.END_TIME]);

            if(!Utils.isNullOrEmpty(userId))
            {
                scheduleRuleDelegate.getRulesByUser(userId, startTime, endTime)
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

            scheduleRuleDelegate.get(scheduleId)
                .then(
                function expertScheduleRuleCreate(schedules) { res.json(schedules); },
                function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
            )
        });

        app.post(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var userId:number = req[ApiConstants.USER].id;
            var scheduleRule:ScheduleRule = req.body[ApiConstants.SCHEDULE_RULE];

            var scheduleRuleId:number = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);
            scheduleRule.setId(scheduleRuleId);
            scheduleRule.setUserId(userId);

            if(scheduleRule.isValid())
            {
                scheduleRuleDelegate.update(scheduleRuleId, scheduleRule)
                    .then(
                    function updateScheduleRule(rule:ScheduleException) { res.json(rule); },
                    function updateScheduleRuleError(error) { res.status(500).json(error) }
                )
            }
            else
                res.status(500).json('Invalid data');
        });

        app.delete(ApiUrlDelegate.scheduleRuleById(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId:number = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);

            scheduleRuleDelegate.delete(scheduleRuleId)
                .then(
                function updateScheduleRule(rule:ScheduleException) { res.json(rule); },
                function updateScheduleRuleError(error) { res.status(500).json(error) }
            )
        });

        app.post(ApiUrlDelegate.scheduleRule(), function (req:express.Request, res:express.Response)
        {
            var userId:number = req[ApiConstants.USER].id;

            var scheduleRule:ScheduleRule = req[ApiConstants.SCHEDULE_RULE];
            scheduleRule.setUserId(userId);

            scheduleRuleDelegate.create(scheduleRule)
                .then(
                function expertScheduleRuleCreated(schedule) { res.json(schedule.toJson()); },
                function expertScheduleRuleCreateFailed(error) { res.send(500,error); }
            )
        });
    }

}
export = ScheduleRuleApi