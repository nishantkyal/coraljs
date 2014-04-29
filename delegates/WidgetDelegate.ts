///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import path                                                     = require('path');
import fs_io                                                    = require('q-io/fs');
import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import FileWatcherDelegate                                      = require('../delegates/FileWatcherDelegate');
import WidgetExpertDelegate                                     = require('../delegates/WidgetExpertDelegate');
import IntegrationMember                                        = require('../models/IntegrationMember');
import Widget                                                   = require('../models/Widget');
import WidgetExpert                                             = require('../models/WidgetExpert');
import WidgetType                                               = require('../enums/WidgetType');
import IncludeFlag                                              = require('../enums/IncludeFlag');
import Config                                                   = require('../common/Config');
import Utils                                                    = require('../common/Utils');
import WidgetDao                                                = require('../dao/WidgetDao');

class WidgetDelegate extends BaseDaoDelegate
{
    private static widgetTemplateCache:{[templateNameAndLocale:string]:string} = {};
    private widgetExpertDelegate = new WidgetExpertDelegate();

    constructor() { super(new WidgetDao()); }

    /* Static constructor workaround */
    private static ctor = (() =>
    {
        new FileWatcherDelegate(Config.get(Config.WIDGET_TEMPLATE_BASE_DIR), [/\.html$/],
            function (files:string[])
            {
                _.each(files, function (fileName:string) { WidgetDelegate.readFileAndCache(fileName); });
            },
            WidgetDelegate.readFileAndCache,
            WidgetDelegate.readFileAndCache,
            WidgetDelegate.readFileAndCache);
    })();

    private static readFileAndCache(fileName:string)
    {

    }

    /**
     * Helper method to embed expert data into widget html. May be used at run time or while generating partial htmls
     * Expert data is specified using pattern <%= %>
     * */
    private renderWidgetExpertData(widgetPartialHtml:string, widgetExpert:WidgetExpert[]):string;
    private renderWidgetExpertData(widgetPartialHtml:string, widgetExpert:WidgetExpert):string;
    private renderWidgetExpertData(widgetPartialHtml:string, widgetExpert:any):string
    {
        var originalSettings = _.templateSettings;
        widgetExpert = [].concat(widgetExpert);

        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g
        };
        var widgetTemplate = _.template(widgetPartialHtml);
        var widgetHtml = widgetTemplate(widgetExpert);

        _.templateSettings = originalSettings;

        return widgetHtml;
    }

    /**
     * Helper method to embed settings into widget html. Used when settings are updated
     * Settings are specified by pattern {{ }}
     * */
    private renderWidgetSettings(widgetPartialHtml:string, widgetSettings:Object):string
    {
        var originalSettings = _.templateSettings;

        _.templateSettings = {
            evaluate: /\{\[([\s\S]+?)\]\}/g,
            interpolate: /\{\{([\s\S]+?)\}\}/g
        };
        var widgetTemplate = _.template(widgetPartialHtml);
        var widgetHtml = widgetTemplate(widgetSettings);

        _.templateSettings = originalSettings;

        return widgetHtml;
    }

    update(criteria:Object, newValues:any, transaction?:any):q.Promise<any>;
    update(criteria:number, newValues:any, transaction?:any):q.Promise<any>;
    update(criteria:any, newValues:any, transaction?:any):q.Promise<any>
    {
        var self = this;

        return super.update(criteria, newValues, transaction)
            .then(self.computeAndCachePartialWidgetHtml);
    }

    /**
     * Compute widget html to be cached
     * May be called when widget settings are updated
     * Or, when experts referred to in expert_resource_id are updated
     */
    computeAndCachePartialWidgetHtml(widget:number):q.Promise<any>;
    computeAndCachePartialWidgetHtml(widget:Widget):q.Promise<any>;
    computeAndCachePartialWidgetHtml(widget:any):q.Promise<any>
    {
        var self = this;

        function computeAndCache(widget:Widget):q.Promise<any>
        {
            return self.widgetExpertDelegate.get(widget.getExpertResourceId())
                .then(
                function widgetExpertFetched(widgetExpert:WidgetExpert[])
                {
                    var widgetBaseHtml = WidgetDelegate.widgetTemplateCache[widget.getType()];
                    var widgetHtmlWithExpertData = self.renderWidgetExpertData(widgetBaseHtml, widgetExpert)
                    var widgetHtmlWithSettings = self.renderWidgetSettings(widgetHtmlWithExpertData, widget.getSettings());
                    return widgetHtmlWithSettings;
                })
                .then(
                function widgetComputed(widgetHtml:string)
                {
                    return fs_io.write(Config.get(Config.WIDGET_PARTIALS_BASE_DIR) + path.sep + widget.getId(), widgetHtml);
                },
                function widgetCachingFailed(error)
                {
                    self.logger.error('Widget html compute failed. Error: %s', error);
                    return fs_io.remove(Config.get(Config.WIDGET_PARTIALS_BASE_DIR) + path.sep + widget.getId());
                });
        };

        if (Utils.getObjectType(widget) == 'Number')
            return this.get(widget).then(computeAndCache);
        else if (Utils.getObjectType(widget) == 'Widget')
            return computeAndCache(widget);
    }

    /* Render the partial widget html into final html to be sent to client*/
    render(widgetId:number):q.Promise<string>
    {
        var self = this;

        var widgetPartialHtmlPath:string = Config.get(Config.WIDGET_PARTIALS_BASE_DIR) + path.sep + widgetId;
        var expertData = {};

        return fs_io.read(widgetPartialHtmlPath)
            .then(
            function partialHtmlRead(data):any
            {
                var widgetPartialHtml:string = data;
                var widgetHtml = self.renderWidgetExpertData(widgetPartialHtml, expertData);

                return widgetHtml;
            },
            function partialHtmlReadError(err)
            {
                self.logger.error('Error occurred while reading partial html for widget id: %s, error: %s', widgetId, err);
                throw('Invalid widget configuration');
            });
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return super.getIncludeHandler(include, result);
    }
}
export = WidgetDelegate
