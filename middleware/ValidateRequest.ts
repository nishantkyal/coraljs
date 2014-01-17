import _                    = require('underscore');
import ApiConstants         = require('../api/ApiConstants');
import LocalizationDelegate = require('../delegates/LocalizationDelegate');
import BaseModel            = require('../models/BaseModel');
import User                 = require('../models/User');
import UserOauth            = require('../models/UserOauth');

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
            }

            if (modelClass)
                req.body[key] = new modelClass(req.body[key]);
        });
        next();
    }

}
export = ValidateRequest