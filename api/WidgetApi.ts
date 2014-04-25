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

            widgetDelegate.render(widgetId)
                .then(
                function widgetRendered(widgetHtml:string) { res.send(widgetHtml); },
                function widgetRenderError(error) { res.send(500); }
            );
        });
    }
}
export = WidgetApi