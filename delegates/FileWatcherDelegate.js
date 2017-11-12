"use strict";
///<reference path='../_references.d.ts'/>
const _ = require("underscore");
const watch = require("watch");
const Utils = require("../common/Utils");
class FileWatcherDelegate {
    constructor(path, filters, initHandler, createHandler, updateHandler, deleteHandler) {
        watch.createMonitor(path, {
            filter: function (file) {
                return _.find(filters, function (filter) {
                    return file.match(filter) != null;
                });
            }
        }, function monitorCreated(monitor) {
            monitor = monitor;
            if (!Utils.isNullOrEmpty(initHandler))
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
module.exports = FileWatcherDelegate;
//# sourceMappingURL=FileWatcherDelegate.js.map