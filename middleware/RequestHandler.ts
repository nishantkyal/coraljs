///<reference path='../_references.d.ts'/>
import express                          = require('express');
import q                                = require('q');
import _                                = require('underscore');
import ApiConstants                     = require('../enums/ApiConstants');
import BaseModel                        = require('../models/BaseModel');
import Coupon                           = require('../models/Coupon');
import User                             = require('../models/User');
import UserOauth                        = require('../models/UserOauth');
import Integration                      = require('../models/Integration');
import IntegrationMember                = require('../models/IntegrationMember');
import PhoneCall                        = require('../models/PhoneCall');
import PricingScheme                    = require('../models/PricingScheme');
import UserPhone                        = require('../models/UserPhone');
import ScheduleRule                     = require('../models/ScheduleRule');
import ScheduleException                = require('../models/ScheduleException');
import UserProfile                      = require('../models/UserProfile');
import Transaction                      = require('../models/Transaction');
import Widget                           = require('../models/Widget');

class RequestHandler
{
    static requireFilters(req, res, next)
    {
        var filters = req.body[ApiConstants.FILTERS];
        if (!filters || _.keys(filters).length == 0)
            res.status(422).json('Fetching all values not allowed. Please specify filters');
        else
            next();
    }

    static requireFields(req, res, next)
    {
        var fields = req.params[ApiConstants.FILTERS];
        if (!fields || fields.length == 0)
            res.status(422).json('Fetching all values not allowed. Please specify filters');
        else
            next();
    }

    static requirePagination(req, res, next)
    {
        req.params['page'] = req.params['page'] || 0;
        req.params['page_size'] = req.params['page_size'] || 20;
        next();
    }

    /* Middleware to parse body attributes into models and parse includes*/
    static parseRequest(req:express.Request, res, next)
    {
        // Parse models
        var modelContainer = req.method == 'GET' ? req.query : req.body;
        _.each(_.keys(modelContainer), function (key)
        {
            var modelClass:typeof BaseModel = null;

            switch (key)
            {
                case ApiConstants.COUPON:
                    modelClass = Coupon;
                    break;
                case ApiConstants.USER:
                    modelClass = User;
                    break;
                case ApiConstants.OAUTH:
                    modelClass = UserOauth;
                    break;
                case ApiConstants.INTEGRATION:
                    modelClass = Integration;
                    break;
                case ApiConstants.INTEGRATION_MEMBER:
                    modelClass = IntegrationMember;
                    break;
                case ApiConstants.PHONE_NUMBER:
                    modelClass = UserPhone;
                    break;
                case ApiConstants.PHONE_CALL:
                    modelClass = PhoneCall;
                    break;
                case ApiConstants.USER_PROFILE:
                    modelClass = UserProfile;
                    break;
                case ApiConstants.SCHEDULE_RULE:
                    modelClass = ScheduleRule;
                    break;
                case ApiConstants.SCHEDULE_EXCEPTION:
                    modelClass = ScheduleException;
                    break;
                case ApiConstants.TRANSACTION:
                    modelClass = Transaction;
                    break;
                case ApiConstants.WIDGET:
                    modelClass = Widget;
                    break;
                case ApiConstants.PRICING_SCHEME:
                    modelClass = PricingScheme;
                    break;
            }

            if (modelClass)
                req.body[key] = new modelClass(modelContainer[key]);
        });
        next();
    }

    static returnPromise(middleware:(...arguments)=>q.Promise<any>):Function
    {
        return function (req:express.Request, res:express.Response, next:Function)
        {
            // Pass on the promise
            next(middleware.apply(this, middleware.arguments));
        };
    }

    static parseParams(handler:(...arguments)=>void):Function
    {
        // Process arguments and parse them
        var self = this;
        var argsRegex:RegExp = new RegExp('\(([^\(]*)\)');
        var parsers = handler.toString().match(argsRegex).splice(1, 99);

        return function (req:express.Request, res:express.Response)
        {
            var modelContainer = req.method == 'GET' ? req.query : req.body;

            self.arguments = _.map(arguments, function (argName)
            {
                var modelClass;

                // Check to see if it's an object
                switch (argName)
                {
                    case ApiConstants.COUPON:
                        modelClass = Coupon;
                        break;
                    case ApiConstants.USER:
                        modelClass = User;
                        break;
                    case ApiConstants.OAUTH:
                        modelClass = UserOauth;
                        break;
                    case ApiConstants.INTEGRATION:
                        modelClass = Integration;
                        break;
                    case ApiConstants.INTEGRATION_MEMBER:
                        modelClass = IntegrationMember;
                        break;
                    case ApiConstants.PHONE_NUMBER:
                        modelClass = UserPhone;
                        break;
                    case ApiConstants.PHONE_CALL:
                        modelClass = PhoneCall;
                        break;
                    case ApiConstants.USER_PROFILE:
                        modelClass = UserProfile;
                        break;
                    case ApiConstants.SCHEDULE_RULE:
                        modelClass = ScheduleRule;
                        break;
                    case ApiConstants.SCHEDULE_EXCEPTION:
                        modelClass = ScheduleException;
                        break;
                    case ApiConstants.TRANSACTION:
                        modelClass = Transaction;
                        break;
                }

                if (modelClass)
                {
                    return new modelClass(modelContainer[argName]);
                    // Check to see if it's a parameter
                    switch (argName)
                    {
                        case ApiConstants.COUPON_ID:
                        case ApiConstants.USER_ID:
                        case ApiConstants.USER_PROFILE_ID:
                        case ApiConstants.EXPERT_ID:
                        case ApiConstants.MEMBER_ID:
                        case ApiConstants.INTEGRATION_ID:
                        case ApiConstants.PHONE_CALL_ID:
                        case ApiConstants.SCHEDULE_ID:
                        case ApiConstants.SCHEDULE_RULE_ID:
                        case ApiConstants.SCHEDULE_EXCEPTION_ID:
                        case ApiConstants.PHONE_NUMBER_ID:
                        case ApiConstants.END_TIME:
                        case ApiConstants.START_TIME:
                        case ApiConstants.DURATION:
                        case ApiConstants.PROFILE_TYPE:
                        case ApiConstants.TYPE:
                            return parseInt(req.params[argName] || modelContainer[argName]);

                        case ApiConstants.USERNAME:
                        case ApiConstants.PASSWORD:
                        case ApiConstants.CODE:
                        case ApiConstants.CODE_VERIFICATION:
                            return (req.params[argName] || modelContainer[argName]).toString();
                    }
                }

                return null;
            });
            handler(arguments);
        };
    }

}
export = RequestHandler
