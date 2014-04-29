///<reference path='../_references.d.ts'/>
import _                                                            = require('underscore');
import fs                                                           = require('fs');
import watch                                                        = require('watch');
import path                                                         = require('path');
import Utils                                                        = require('../common/Utils');

class FileWatcherDelegate
{
    constructor(path:string, filters:RegExp[], initHandler?:(files:string[])=>void, createHandler?:(file:string, stat:string)=>void, updateHandler?:(file:string, curr:string, prev:string)=>void, deleteHandler?:(file:string, stat:string)=>void)
    {
        watch.createMonitor(path,
            {
                filter: function (file:string)
                {
                    return _.find(filters, function (filter:RegExp):boolean
                    {
                        return file.match(filter) != null;
                    });
                }
            },
            function monitorCreated(monitor)
            {
                monitor = monitor;
                initHandler(_.keys(monitor.files));

                if (!Utils.isNullOrEmpty(createHandler))
                    monitor.on("created", createHandler);

                if (!Utils.isNullOrEmpty(deleteHandler))
                    monitor.on("removed", deleteHandler);

                if (!Utils.isNullOrEmpty(updateHandler))
                    monitor.on("changed", updateHandler);
            });
    }

}
export = FileWatcherDelegate