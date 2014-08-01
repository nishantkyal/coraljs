import AbstractSessionData                                      = require('../AbstractSessionData');

class StaticRoute
{
    constructor(app)
    {
        app.get('/privacy', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/privacy-policy', sessionData);
        });

        app.get('/terms-of-use', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/terms-of-use', sessionData);
        });
    }
}
export = StaticRoute