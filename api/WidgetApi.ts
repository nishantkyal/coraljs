import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import WidgetDelegate                                       = require('../delegates/WidgetDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');

class WidgetApi
{
    constructor(app, secureApp)
    {
        var widgetDelegate = new WidgetDelegate();

        app.get(ApiUrlDelegate.widget(), function (req:express.Request, res:express.Response)
        {
            var widgetId:number = parseInt(req.params[ApiConstants.WIDGET_ID]);
            res.send(req.query.callback + '("<div>' + widgetId + '</div>")');
            return;

            // TODO: Handle caching of response sent by this endpoint
            // Since the url is fixed, response will get cached
            // Which is fine for certain cases (e.g. my own call-me button)
            // TODO: Handle customizable widget styling alongwith default styles
            // TODO: Handle widget versions
            // TODO: Handle cross-domain goofiness
            // TODO: Compile Widget jade

            widgetDelegate.render(widgetId)
                .then(
                function widgetRendered(widgetHtml:string)
                {
                },
                function widgetRenderError(error) { res.send(500); }
            );
        });
    }
}
export = WidgetApi