

/**
* Middleware to handle IE cross domain goofiness
**/
var IECrossDomain = (function () {
    function IECrossDomain() {
    }
    IECrossDomain.fixRequestForIe = function (req, res, next) {
        // Append access control header to all responses for cross domain communication
        res.header('Access-Control-Allow-Origin', '*');
        if (req.headers.hasOwnProperty('Access-Control-Request-Method') && req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Origin,Content-Type, Accept');
        }

        if (!req.headers.hasOwnProperty('Content-Type'))
            req.headers['Content-Type'] = 'application/json';

        if (req.param('_method') != null)
            req.method = req.param('_method');

        next();
    };
    return IECrossDomain;
})();

module.exports = IECrossDomain;

//# sourceMappingURL=IECrossDomain.js.map
