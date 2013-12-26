import _                    = require('underscore');
import ApiConstants         = require('../api/ApiConstants');
import LocalizationDelegate = require('../delegates/LocalizationDelegate');

class ValidateRequest {

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

    static requireLocalization(req, res, next)
    {
        // TODO: Set default locale if not already set
        next();
    }

    /* Middleware to parse body attributes into models and check if they're valid */
    static validateBody(req, res, next)
    {
        // TODO: Implement this
        next();
    }

}
export = ValidateRequest