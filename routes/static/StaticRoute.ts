import AbstractSessionData                                      = require('../AbstractSessionData');

class StaticRoute
{
    constructor(app, secureApp)
    {
        app.get('/privacy-policy', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/privacy-policy', sessionData);
        });
    }
}
export = StaticRoute