var _ = require('underscore');
var ApiConstants = require('../api/ApiConstants');
var LocalizationDelegate = require('../delegates/LocalizationDelegate');

var ValidateRequest = (function () {
    function ValidateRequest() {
    }
    ValidateRequest.requireFilters = function (req, res, next) {
        var filters = req.body[ApiConstants.FILTERS];
        if (!filters || _.keys(filters).length == 0)
            res.status(422).json('Fetching all values not allowed. Please specify filters');
else
            next();
    };

    ValidateRequest.requireFields = function (req, res, next) {
        var fields = req.params[ApiConstants.FILTERS];
        if (!fields || fields.length == 0)
            res.status(422).json('Fetching all values not allowed. Please specify filters');
else
            next();
    };

    ValidateRequest.requirePagination = function (req, res, next) {
        req.params['page'] = req.params['page'] || 0;
        req.params['page_size'] = req.params['page_size'] || 20;
        next();
    };

    ValidateRequest.requireLocalization = function (req, res, next) {
        // TODO: Set default locale if not already set
        next();
    };

    ValidateRequest.validateBody = /* Middleware to parse body attributes into models and check if they're valid */
    function (req, res, next) {
        // TODO: Implement this
        next();
    };
    return ValidateRequest;
})();

module.exports = ValidateRequest;

