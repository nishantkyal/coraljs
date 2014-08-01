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
            var self = this;
            var theme:string = req.query[ApiConstants.THEME] || 'light';
            var size:string = req.query[ApiConstants.SIZE] || 'small';
            var verb:string = req.query[ApiConstants.VERB];
            var userId:number = parseInt(req.query[ApiConstants.USER_ID]);

            // TODO: Handle caching of response sent by this endpoint
            // Since the url is fixed, response will get cached
            // Which is fine for certain cases (e.g. my own call-me button)
            // TODO: Handle customizable widget styling along with default styles
            // TODO: Handle widget versions
            // TODO: Handle cross-domain goofiness
            // TODO: Compile Widget jade

            widgetDelegate.render(userId, size, theme, verb)
                .then(
                function widgetRendered(widgetHtml:string)
                {
                    res.send(widgetHtml);
                },
                function widgetRenderError(error)
                {
                    //self.logger.debug('Widget rendering failed. Error: %s', JSON.stringify(error));
                    res.send(error || 'An error occured in rendering Widget.').status(500);
                });
        });
    }
}
export = WidgetApi