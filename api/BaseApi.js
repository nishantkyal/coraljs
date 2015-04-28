///<reference path='../_references.d.ts'/>
var _ = require('underscore');
var BaseApi = (function () {
    function BaseApi(app) {
    }
    BaseApi.getEndpoint = function (baseUrl) {
        return null;
    };
    BaseApi.getIdEndpoint = function (id, baseUrl) {
        return null;
    };
    BaseApi.prototype.promiseMiddleware = function (handler) {
        var handlerSignature = handler.toString();
        var handlerArgs = handlerSignature.match(/\((.*)\)/)[1].split(",");
        var handlerArgParsers = _.map(handlerArgs, function (argName) {
            if (argName.substr(argName.length - 2) == 'Id')
                return function (req) {
                    return parseInt(req.params[argName] || req.query[argName]);
                };
            if (argName == BaseApi.INCLUDE)
                return function (req) {
                    try {
                        return JSON.parse(req.query[BaseApi.INCLUDE]);
                    }
                    catch (e) {
                        return [];
                    }
                };
        });
        return function (req, res) {
            var parsedArguments = _.map(handlerArgParsers, function (parser) {
                return parser.call(this, req);
            });
            parsedArguments.push(req);
            parsedArguments.push(res);
            handler.apply(this, parsedArguments).then(function resolved(result) {
                res.json(result);
            }).fail(function handleError(error) {
                res.send(500, error.message);
            });
        };
    };
    BaseApi.INCLUDE = 'include';
    return BaseApi;
})();
module.exports = BaseApi;
//# sourceMappingURL=BaseApi.js.map