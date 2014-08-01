import _                                                    = require('underscore');
import express                                              = require('express');
import ScheduleTaskDelegate                                 = require('../delegates/ScheduledTaskDelegate')
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import PrintTimestampTask                                       = require('../models/tasks/PrintTimestampTask');

class ScheduledTaskApi
{
    constructor(app)
    {
        app.get(ApiUrlDelegate.scheduleTask(), function(req:express.Request, res:express.Response)
        {
            var tasks = new ScheduleTaskDelegate().getAll();
            var tasksArray = [];
            _.each(tasks,  function (task:any){
                delete task.task['logger'];
                tasksArray.push(task.task);
            });
            res.json(tasksArray).status(200);
        });

        app.post(ApiUrlDelegate.scheduleTask(), function(req:express.Request, res:express.Response)
        {
            var task:any = req.body['task'];
            new ScheduleTaskDelegate().scheduleAt(new PrintTimestampTask(task.startTime), task.startTime)
            .then(
                function taskScheduled() { res.send(200); },
                function taskSchedulingFailed() { res.send(500); }
            );

        });

    }
}
export = ScheduledTaskApi