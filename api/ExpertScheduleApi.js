
var ApiConstants = require('./ApiConstants');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var ExpertScheduleDelegate = require('../delegates/ExpertScheduleDelegate');
var AccessControl = require('../middleware/AccessControl');
var Schedule = require('../models/Schedule');
var IntegrationMember = require('../models/IntegrationMember');

/**
Rest Calls for Third party integrations
**/
var ExpertScheduleApi = (function () {
    function ExpertScheduleApi(app) {
        var expertScheduleDelegate = new ExpertScheduleDelegate();

        /** Add schedule **/
        app.put(ApiUrlDelegate.scheduleByExpert(), AccessControl.allowDashboard, function (req, res) {
            // TODO: Validate input
            var schedule = new Schedule(req.body['schedule']);
            var expertId = req.params['expertId'];
            expertScheduleDelegate.create(schedule, expertId).then(function handleExpertScheduleAdded(result) {
                res.json(result);
            }, function handleExpertScheduleError(err) {
                res.status(500).json(err);
            });
        });

        /** Search schedules */
        app.get(ApiUrlDelegate.schedule(), AccessControl.allowDashboard, function (req, res) {
            var keywords = req.query['q'].split(',');
            var startTime = req.query['start_time'];
            var endTime = req.query['end_time'];
            expertScheduleDelegate.searchSchedule(keywords, startTime, endTime).then(function handleExpertsFound(result) {
                res.json(result);
            }, function handleExpertSearchError(err) {
                res.status(500).json(err);
            });
        });

        /** Get schedule by id */
        app.get(ApiUrlDelegate.scheduleById(), AccessControl.allowDashboard, function (req, res) {
            var scheduleId = req.params['scheduleId'];
            var fields = req.query[ApiConstants.FIELDS];

            expertScheduleDelegate.get(scheduleId, fields).then(function handleScheduleFetched(schedule) {
                res.json(schedule);
            }, function handleScheduleFetchError(err) {
                res.status(500).json(err);
            });
        });

        /** Update schedule **/
        app.post(ApiUrlDelegate.scheduleById(), AccessControl.allowDashboard, function (req, res) {
            var scheduleId = req.params['scheduleId'];
            var schedule = req.body['schedule'];
            expertScheduleDelegate.update(schedule, scheduleId).then(function handleScheduleUpdated(schedule) {
                res.json(schedule);
            }, function handleScheduleUpdateError(err) {
                res.status(500).json(err);
            });
        });

        /** Delete schedule **/
        app.delete(ApiUrlDelegate.scheduleById(), AccessControl.allowDashboard, function (req, res) {
            var scheduleId = req.params['scheduleId'];
            expertScheduleDelegate.delete(scheduleId).then(function handleScheduleDeleted(schedule) {
                res.json(schedule);
            }, function handleScheduleDeleteError(err) {
                res.status(500).json(err);
            });
        });

        /* Get schedules by expert */
        app.get(ApiUrlDelegate.scheduleByExpert(), AccessControl.allowDashboard, function (req, res) {
            var expertId = req.params['expertId'];
            expertScheduleDelegate.search({ 'integration_member_id': expertId }).then(function handleExpertScheduleSearched(result) {
                res.json(result);
            }, function handleExpertScheduleSearchError(err) {
                res.status(500).json(err);
            });
        });
    }
    return ExpertScheduleApi;
})();

module.exports = ExpertScheduleApi;

