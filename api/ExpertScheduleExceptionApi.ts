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
 Rest Calls for expert schedule exceptions
 **/
class ExpertScheduleExceptionApi
{
    constructor(app)
    {
        var expertScheduleExceptionDelegate = new ExpertScheduleExceptionDelegate();

        app.put(ApiUrlDelegate.scheduleException(), function (req:express.Request, res:express.Response)
        {
            var scheduleException:ExpertScheduleException = req.body[ApiConstants.SCHEDULE_EXCEPTION];

            if(scheduleException.isValid())
            {
                expertScheduleExceptionDelegate.createException(scheduleException)
                    .then(
                    function expertScheduleRuleCreated(schedule) { res.json(schedule); },
                    function expertScheduleRuleCreateFailed(error) { res.status(500).json(error); }
                )
            }
            else
                res.status(500).json('Invalid data');
        });

        app.get(ApiUrlDelegate.scheduleExceptionById(), function (req:express.Request, res:express.Response)
        {
            var exceptionId:number = parseInt(req.params[ApiConstants.SCHEDULE_EXCEPTION_ID]);

                expertScheduleExceptionDelegate.getExceptionsbyId(exceptionId)
                    .then(
                    function getScheduleException(exceptions:ExpertScheduleException[]) { res.json(exceptions); },
                    function getScheduleExceptionError(error) { res.status(500).json(error) }
                )
        });

        app.get(ApiUrlDelegate.scheduleException(), function (req:express.Request, res:express.Response)
        {
            var expertId:number = parseInt(req.query[ApiConstants.EXPERT_ID]);
            var startTime:number = parseInt(req.query[ApiConstants.START_TIME]);
            var endTime:number = parseInt(req.query[ApiConstants.END_TIME]);

            if(!Utils.isNullOrEmpty(expertId) && !Utils.isNullOrEmpty(startTime) && !Utils.isNullOrEmpty(endTime))
            {
                expertScheduleExceptionDelegate.getExceptionsByIntegrationMemberId(expertId, startTime, endTime)
                    .then(
                    function getScheduleException(exceptions:ExpertScheduleException[]) { res.json(exceptions); },
                    function getScheduleExceptionError(error) { res.status(500).json(error) }
                )
            }
            else
                res.status(422).json('Fetching all values not allowed. Please specify filters');
        });

        app.post(ApiUrlDelegate.scheduleException(), function (req:express.Request, res:express.Response)
        {
            var scheduleException:ExpertScheduleException = req.body[ApiConstants.SCHEDULE_EXCEPTION];

            if(scheduleException.isValid())
            {
                expertScheduleExceptionDelegate.updateException(scheduleException)
                    .then(
                    function updateScheduleException(exception:ExpertScheduleException){ res.json(exception); },
                    function updateScheduleExceptionError(error){ res.status(500).json(error) }
                )
            }
            else
                res.status(500).json('Invalid data');
        });

        app.delete(ApiUrlDelegate.scheduleExceptionById(), function (req:express.Request, res:express.Response)
        {
            var exceptionId:number = parseInt(req.params[ApiConstants.SCHEDULE_EXCEPTION_ID]);

            expertScheduleExceptionDelegate.deleteByExceptionId(exceptionId)
                .then(
                function exceptionDeleted(exceptionId) { res.json(exceptionId); },
                function exceptionDeletedError(error) { res.status(500).json(error) }
            )
        });
    }

}
export = ExpertScheduleExceptionApi