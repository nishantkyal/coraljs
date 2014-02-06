///<reference path='../_references.d.ts'/>
import ApiConstants                     = require('../api/ApiConstants');
import BaseModel                        = require('../models/BaseModel');
import User                             = require('../models/User');
import UserOauth                        = require('../models/UserOauth');
import Integration                      = require('../models/Integration');
import IntegrationMember                = require('../models/IntegrationMember');
import PhoneCall                        = require('../models/PhoneCall');
import PhoneNumber                      = require('../models/PhoneNumber');
import SMS                              = require('../models/SMS');

class ValidateRequest
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

    /* Middleware to parse body attributes into models and check if they're valid */
    static parseBody(req, res, next)
    {
        _.each(_.keys(req.body), function (key)
        {
            var modelClass:typeof BaseModel = null;
            switch (key)
            {
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
                    modelClass = PhoneNumber;
                    break;
                case ApiConstants.SMS:
                    modelClass = SMS;
                    break;
                case ApiConstants.PHONE_CALL:
                    modelClass = PhoneCall;
                    break;
            }

            if (modelClass)
                req.body[key] = new modelClass(req.body[key]);
        });
        next();
    }

}
export = ValidateRequest