import _                                                    = require('underscore');
import log4js                                               = require('log4js');
import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import WidgetDelegate                                       = require('../delegates/WidgetDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');
import Utils                                                = require('../common/Utils');

class WidgetApi
{
    private logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(app)
    {
        var widgetDelegate = new WidgetDelegate();

        /**
         * Get rendered widget html for display on third party site
         */
        app.get(ApiUrlDelegate.widget(), function (req:express.Request, res:express.Response)
        {
            var theme:string = req.query[ApiConstants.THEME] || 'light';
            var verb:string = req.query[ApiConstants.VERB];
            var userId:number = parseInt(req.query['user_id']);
            var width:number = parseInt(req.query[ApiConstants.WIDTH]) || 300;
            var message:string = Utils.escapeHTML(req.query[ApiConstants.TITLE] || '');

            var user_name:boolean = req.query[ApiConstants.USER_NAME] == "true";
            var profile_picture:boolean = req.query[ApiConstants.PROFILE_PICTURE] == "true";
            var timezone:boolean = req.query[ApiConstants.TIMEZONE] == "true";
            var availability:boolean = req.query[ApiConstants.AVAILIBILITY] == "true";
            var pricing:boolean = req.query[ApiConstants.PRICING] == "true";
            var skills:boolean = req.query[ApiConstants.SKILLS] == "true";

            // Since the url is fixed, response will get cached
            // Which is fine for certain cases (e.g. my own call-me button)
            // TODO: Handle widget versions
            // TODO: Handle cross-domain goofiness

            widgetDelegate.render(userId, width, message, theme, verb, {
                user_name: user_name,
                profile_picture: profile_picture,
                timezone: timezone,
                availability: availability,
                pricing: pricing,
                skills: skills
            })
                .then(
                function widgetRendered(widgetHtml:string):any
                {
                    res.send(widgetHtml);
                },
                function widgetRenderError(error)
                {
                    //self.logger.debug('Widget rendering failed. Error: %s', JSON.stringify(error));
                    res.send(500, error.message || 'An error occured in rendering Widget.');
                });
        });
    }
}
export = WidgetApi