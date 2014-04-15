///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import FileWatcherDelegate                                      = require('../delegates/FileWatcherDelegate');
import IntegrationMember                                        = require('../models/IntegrationMember');
import WidgetType                                               = require('../enums/WidgetType');

class WidgetDelegate
{
    /* Static constructor workaround */
    private static ctor = (() =>
    {
        new FileWatcherDelegate('/var/searchntalk/emailTemplates', [/\.html$/],
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

    applySettings(id:number, settings:Object):q.Promise<string>
    {
        return null;
    }

    applyExpertData(id:number, data:Object):q.Promise<string>
    {
        return null;
    }


}
export = WidgetDelegate