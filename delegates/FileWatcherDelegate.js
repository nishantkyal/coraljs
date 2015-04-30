var _ = require('underscore');
var watch = require('watch');
var Utils = require('../common/Utils');
var FileWatcherDelegate = (function () {
    function FileWatcherDelegate(path, filters, initHandler, createHandler, updateHandler, deleteHandler) {
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
    return FileWatcherDelegate;
})();
module.exports = FileWatcherDelegate;
//# sourceMappingURL=FileWatcherDelegate.js.map