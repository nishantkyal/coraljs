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

        app.get('/about-us', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/about-us', sessionData);
        });

        app.get('/contact-us', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/contact-us', sessionData);
        });

        app.get('/faq', function(req, res)
        {
            var sessionData = new AbstractSessionData(req);
            res.render('static/faq', sessionData);
        });
    }
}
export = StaticRoute