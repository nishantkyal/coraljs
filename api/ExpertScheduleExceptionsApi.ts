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
 Rest Calls for expert schedule exceptions
 **/
class ExpertScheduleExceptionsApi
{
    constructor(app)
    {
        var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();

        app.put(ApiUrlDelegate.scheduleExceptionByRuleId(), function (req:express.Request, res:express.Response)
        {
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            var scheduleRuleId = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);

            var scheduleException = req.body[ApiConstants.SCHEDULE_EXCEPTION];
            scheduleException.setIntegrationMemberId(expertId);
            scheduleException.setScheduleRuleId(scheduleRuleId);

            expertScheduleExceptionDelegate.create(scheduleException)
                .then(
                function expertScheduleRuleCreated(schedule) { res.json(schedule); },
                function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
            )

        });

        app.get(ApiUrlDelegate.scheduleExceptionByRuleId(), function (req:express.Request, res:express.Response)
        {
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            var scheduleRuleId = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);

            var currentDate = new Date();
            var options = { //TODO division by 1000 - proper way??
                startDate: currentDate.getTime()/1000, // current date
                endDate: (currentDate.setFullYear(currentDate.getFullYear() + 1))/1000 // 1 year from current date
            };

            expertScheduleExceptionDelegate.getExceptionsbyRuleId(scheduleRuleId)
                .then(
                function getScheduleException(exceptions:ExpertScheduleException[])
                {
                    res.json(exceptions);
                },
                function getScheduleExceptionError(error){res.status(500).json(error)}
            )
        });

        //to get all exceptions for given expert - most probably redundant function
        app.get(ApiUrlDelegate.scheduleExceptionByExpertId(), function (req:express.Request, res:express.Response)
        {
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);
            var currentDate = new Date();
            var options = { //TODO division by 1000 - proper way??
                startDate: currentDate.getTime()/1000, // current date
                endDate: (currentDate.setFullYear(currentDate.getFullYear() + 1))/1000 // 1 year from current date
            };
            expertScheduleExceptionDelegate.getExceptionsByIntegrationMemberId(expertId)
                .then(
                function getScheduleException(exceptions:ExpertScheduleException[])
                {
                    res.json(exceptions);
                },
                function getScheduleExceptionError(error){res.status(500).json(error)}
            )
        });

        app.post(ApiUrlDelegate.scheduleExceptionByRuleId(), function (req:express.Request, res:express.Response)
        {
            var scheduleRuleId = parseInt(req.params[ApiConstants.SCHEDULE_RULE_ID]);
            var expertId = parseInt(req.params[ApiConstants.EXPERT_ID]);

            var scheduleException = req.body[ApiConstants.SCHEDULE_EXCEPTION];
            scheduleException.setScheduleRuleId(scheduleRuleId);
            scheduleException.setIntegrationMemberId(expertId);

            expertScheduleExceptionDelegate.updateException(scheduleException)
                .then
            (
                function updateScheduleException(exception:ExpertScheduleException){res.json(exception);},
                function updateScheduleExceptionError(error){res.status(500).json(error)}
            )
        });

        app.delete(ApiUrlDelegate.scheduleExceptionByExceptionId(), function (req:express.Request, res:express.Response)
        {
            var exceptionId = parseInt(req.params[ApiConstants.SCHEDULE_EXCEPTION_ID]);

            expertScheduleExceptionDelegate.deleteByExceptionId(exceptionId)
                .then
            (
                function exceptionDeleted(exceptionId) {res.json(exceptionId);},
                function exceptionDeletedError(error) {res.status(500).json(error)}
            )
        });
    }

}
export = ExpertScheduleExceptionsApi