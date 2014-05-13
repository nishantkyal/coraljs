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
            var tasksArray = [];
            _.each(tasks,  function (task:any){
                delete task.task['logger'];
                tasksArray.push(task.task);
            })
            res.send(JSON.stringify(tasksArray)).status(200);
        });
    }
}
export = ScheduledTaskApi