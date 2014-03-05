///<reference path='../../_references.d.ts'/>
import _                                                    = require('underscore');
import moment                                               = require('moment');
import express                                              = require('express');
import passport                                             = require('passport');
import log4js                                               = require('log4js');
import AuthenticationDelegate                               = require('../../delegates/AuthenticationDelegate');
import IntegrationDelegate                                  = require('../../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                            = require('../../delegates/IntegrationMemberDelegate');
import PhoneCallDelegate                                    = require('../../delegates/PhoneCallDelegate');
import Utils                                                = require('../../common/Utils');
import Config                                               = require('../../common/Config');
import PhoneCall                                            = require('../../models/PhoneCall');
import ExpertSchedule                                       = require('../../models/ExpertSchedule');
import CallStatus                                           = require('../../enums/CallStatus');
import ApiConstants                                         = require('../../enums/ApiConstants');
import IncludeFlag                                          = require('../../enums/IncludeFlag');

class CallFlowRoute
{
    logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(app)
    {
        // Actual rendered pages
        app.get('/expert/:expertId/call', this.index.bind(this));
        app.get('/call/auth', CallFlowRouteMiddleware.requireScheduleAndExpert.bind(this), this.authentication.bind(this));
        app.get('/call/details', CallFlowRouteMiddleware.requireScheduleAndExpert.bind(this), this.callDetails.bind(this));
        app.post('/call/details', CallFlowRouteMiddleware.requireScheduleAndExpert.bind(this), this.callDetailsUpdated.bind(this));
        app.get('/call/checkout', this.checkout.bind(this));

        // Auth related routes
        app.post('/call/login', passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: '/call/auth', successRedirect: '/call/details'}));
        app.post('/call/register', passport.authenticate(AuthenticationDelegate.STRATEGY_REGISTER, {failureRedirect: '/call/auth', successRedirect: '/call/details'}));
        app.get('/call/login/fb', passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {scope: ['email']}));
        app.get('/call/login/fb/callback', passport.authenticate(AuthenticationDelegate.STRATEGY_FACEBOOK_CALL_FLOW, {failureRedirect: '/call/auth', scope: ['email'], successRedirect: '/call/details'}));
    }

    index(req:express.Request, res:express.Response)
    {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var self = this;
        var expertId = req.params['expertId'];

        new IntegrationMemberDelegate().get(expertId, null, [IncludeFlag.INCLUDE_SCHEDULES, IncludeFlag.INCLUDE_USER])
            .then(
            function handleExpertFound(expert)
            {
                var pageData = {};
                try
                {
                    pageData['user'] = expert.user[0];
                    pageData['schedules'] = JSON.stringify(_.map(expert['schedule'], function (schedule)
                    {
                        schedule['id'] = Utils.getRandomInt(10000, 99999);
                        schedule['end_time_date'] = moment(schedule['start_time']).add('seconds', schedule['duration']).format('DD-MM-YYYY h:mm A');
                        schedule['start_time_date'] = moment(schedule['start_time']).format('DD-MM-YYYY h:mm A');
                        return schedule;
                    }));
                } catch (e)
                {
                    self.logger.debug('Error occurred while rendering index page, %s', e);
                    res.send(500);
                }

                CallFlowRouteMiddleware.setSelectedExpert(req, expert);
                CallFlowRouteMiddleware.setSelectedSchedule(req, null);

                res.render('callFlow/index', pageData);
            },
            function handleExpertSearchFailed(error) { res.status(401).json('Error getting expert details for id: ' + expertId)}
        );
    }

    authentication(req:express.Request, res:express.Response)
    {
        var scheduleIds:string[] = CallFlowRouteMiddleware.getSelectedSchedule(req);
        var expert = CallFlowRouteMiddleware.getSelectedExpert(req);
        var schedules = expert['schedule'];
        var user = expert.user[0];

        var pageData = {};
        pageData['fb_app_id'] = Config.get('fb.app_id');
        pageData['user'] = user;
        pageData['price_per_min'] = scheduleIds['price_per_min'];
        pageData['price_unit'] = '$';
        pageData['schedules'] = [];

        _.each(scheduleIds, function(scheduleId)
        {
            var schedule = _.find(schedules, function(s) {
                return s['id'] == parseInt(scheduleId);
            });

            if (schedule)
            {
                pageData['schedules'].push({
                    'start_time_date': moment(schedule['start_time']).format('DD-MM-YYYY h:mm A'),
                    'end_time_date': moment(schedule['start_time']).add('seconds', schedule['duration']).format('DD-MM-YYYY h:mm A')
                });
            }
        });

        res.render('callFlow/authenticate', pageData);
    }

    callDetails(req:express.Request, res:express.Response)
    {
        var expert = CallFlowRouteMiddleware.getSelectedExpert(req);
        var schedule = CallFlowRouteMiddleware.getSelectedSchedule(req);
        var call = new PhoneCall();
        var user = expert['user'][0];

        call.setExpertId(expert['id']);
        call.setScheduleId(schedule['id']);
        CallFlowRouteMiddleware.setCallDetails(req, call);

        var pageData = {};
        pageData['fb_app_id'] = Config.get('fb.app_id');
        pageData['user'] = user;
        pageData['price_per_min'] = schedule['price_per_min'];
        pageData['price_unit'] = '$';

        res.render('callFlow/details', pageData)
    }

    callDetailsUpdated(req:express.Request, res:express.Response)
    {
        var schedule = new ExpertSchedule(CallFlowRouteMiddleware.getSelectedSchedule(req));
        var updatedCall:PhoneCall = new PhoneCall(req.body['call']);
        var originalCall:PhoneCall = CallFlowRouteMiddleware.getCallDetails(req);
        updatedCall.setExpertId(originalCall.getExpertId());
        updatedCall.setScheduleId(originalCall.getScheduleId());
        updatedCall.setStatus(CallStatus.SCHEDULED);

        // Check that call has not been scheduled outside selected schedule
        var callStartTime = updatedCall.getStartTime();
        var callEndTime = callStartTime + updatedCall.getDuration();
        var scheduleStartTime = schedule.getStartTime();
        var scheduleEndTime = schedule.getStartTime() + schedule.getDuration();

        if (false && callStartTime < scheduleStartTime || callEndTime > scheduleEndTime)
        {
            res.send(400, 'Call can\'t be planned outside selected schedule, please go back and select another schedule');
            return;
        }

        if (updatedCall.isValid())
        {
            CallFlowRouteMiddleware.setCallDetails(req, updatedCall);
            res.send('Success');
        }
        else
            res.send(400, 'Incomplete call details');
    }

    checkout(req:express.Request, res:express.Response)
    {
        var call:PhoneCall = new PhoneCall(CallFlowRouteMiddleware.getCallDetails(req));
        var schedule = CallFlowRouteMiddleware.getSelectedSchedule(req);
        var expert = CallFlowRouteMiddleware.getSelectedExpert(req);
        var user = expert['user'];

        // 1. Save call
        // 2. Create transaction
        if (call.isValid())
            new PhoneCallDelegate().create(call)
                .then(
                function callPlanned(response)
                {
                    var result = response.getBody();
                    var pageData = {};
                    pageData['call_id'] = result['id'];
                    pageData['expert_name'] = user['first_name'] + ' ' + user['last_name'];
                    pageData['start_time'] = moment.utc(call['start_time'] / 1000).format('DD-MM-YYYY h:mm A');
                    pageData['duration'] = call['duration'];

                    // Render checkout page
                    res.render('callFlow/checkout', pageData);
                },
                function callPlanningFailed()
                {
                    res.send(500, 'Invalid call details. Can\'t schedule');
                });
        else
        {
            res.send(500, 'Invalid call details. Can\'t schedule');
            this.logger.error('Attempted invalid call scheduling. Call: ' + call);
        }
    }

}

class CallFlowRouteMiddleware
{
    /* Helper methods to manage session variables for call flow */
    // TODO: Move all session storage to one class
    private static SESSION_VARS_CALL_DETAILS:string = 'call_details';
    private static SESSION_VARS_EXPERT:string = 'call_expert';
    private static SESSION_VARS_SCHEDULE:string = 'call_schedule';

    static setCallDetails(req, call:any):void { req.session[CallFlowRouteMiddleware.SESSION_VARS_CALL_DETAILS] = call; }
    static getCallDetails(req):any { return req.session[CallFlowRouteMiddleware.SESSION_VARS_CALL_DETAILS]; }

    static setSelectedExpert(req, expert:any):void { req.session[CallFlowRouteMiddleware.SESSION_VARS_EXPERT] = expert; }
    static getSelectedExpert(req):any{ return req.session[CallFlowRouteMiddleware.SESSION_VARS_EXPERT]; }

    static setSelectedSchedule(req, schedule:any):void { req.session[CallFlowRouteMiddleware.SESSION_VARS_SCHEDULE] = schedule; }
    static getSelectedSchedule(req):any { return req.session[CallFlowRouteMiddleware.SESSION_VARS_SCHEDULE]; }

    /* Helper middleware to make sure we've everything before rendering a page */
    static requireScheduleAndExpert(req, res, next)
    {
        var expert = CallFlowRouteMiddleware.getSelectedExpert(req);
        var selectedScheduleIds = CallFlowRouteMiddleware.getSelectedSchedule(req);
        var scheduleIds:string[] = [].concat(req.query[ApiConstants.SCHEDULE_ID]);

        if (!Utils.isNullOrEmpty(selectedScheduleIds) && !Utils.isNullOrEmpty(expert))
        {
            next();
        }
        else if (!Utils.isNullOrEmpty(scheduleIds) && !Utils.isNullOrEmpty(expert))
        {
            CallFlowRouteMiddleware.setSelectedSchedule(req, scheduleIds);
            next();
        }
        else if (!Utils.isNullOrEmpty(expert))
        {
            res.redirect('/expert/' + expert['id'] + '/call');
        }
        else
        {
            res.send(400, "This is strange, how did you land up here without selecting an expert");
        }
    }
}
export = CallFlowRoute