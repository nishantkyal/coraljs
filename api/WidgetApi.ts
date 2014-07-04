import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import WidgetDelegate                                       = require('../delegates/WidgetDelegate');
import Widget                                               = require('../models/Widget');
import ApiConstants                                         = require('../enums/ApiConstants');

class WidgetApi
{
    constructor(app, secureApp)
    {
        var widgetDelegate = new WidgetDelegate();

        /**
         * Get rendered widget html for display on third party site
         */
        app.get(ApiUrlDelegate.publicWidget(), function (req:express.Request, res:express.Response)
        {
            var widgetId:number = parseInt(req.params[ApiConstants.WIDGET_ID]);

            // TODO: Handle caching of response sent by this endpoint
            // Since the url is fixed, response will get cached
            // Which is fine for certain cases (e.g. my own call-me button)
            // TODO: Handle customizable widget styling along with default styles
            // TODO: Handle widget versions
            // TODO: Handle cross-domain goofiness
            // TODO: Compile Widget jade

            widgetDelegate.render(widgetId)
                .then(
                function widgetRendered(widgetHtml:string)
                {
                    res.send(widgetHtml);
                },
                function widgetRenderError(error) { res.send('An error occured in rendering Widget.').status(500); }
            );
        });

        app.get(ApiUrlDelegate.widgetById(), function(req:express.Request, res:express.Response)
        {
            var widgetId:number = parseInt(req.params[ApiConstants.WIDGET_ID]);

            widgetDelegate.get(widgetId)
            .then(
                function widgetFetched(widget:Widget) { res.json(widget.toJson()); },
                function widgetFetchError(err) { res.send(500); }
            );
        });

        app.put(ApiUrlDelegate.widget(), function(req:express.Request, res:express.Response)
        {
            var widget:Widget = req.body[ApiConstants.WIDGET];

            widgetDelegate.create(widget)
                .then(
                function widgetCreated(widget:Widget) { res.send('Widget Created').status(200); },
                function widgetCreateError(err) { res.send(err).status(500); }
            );
        });

        app.post(ApiUrlDelegate.widgetById(), function(req:express.Request, res:express.Response)
        {
            var widgetId:number = parseInt(req.params[ApiConstants.WIDGET_ID]);
            var widget:Widget = req.body[ApiConstants.WIDGET];

            widgetDelegate.update(widgetId, widget)
            .then(
                function widgetUpdated() { res.send(200); },
                function widgetUpdateError(err) { res.send(500); }
            );
        });

    }
}
export = WidgetApi