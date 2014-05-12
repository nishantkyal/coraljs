import _                                                    = require('underscore');
import express                                              = require('express');
import ScheduleTaskDelegate                                 = require('../delegates/ScheduledTaskDelegate')
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');

class ScheduledTaskApi
{
    constructor(app)
    {
        app.get(ApiUrlDelegate.scheduleTask(), function(req:express.Request, res:express.Response)
        {
            var tasks = new ScheduleTaskDelegate().getAll();
            var tasksJson;
            _.each(tasks,  function (task){
                tasksJson = task.toJson();
            })
            res.json(tasksJson);
        });
    }
}
export = ScheduledTaskApi