///<reference path='../_references.d.ts'/>
import i18n                                         = require('i18n');
import _                                            = require('underscore');

/*
 Delegate to manage localization
 */
class LocalizationDelegate
{
    /* Static constructor workaround */
    private static ctor = (() =>
    {
        i18n.configure({
            defaultLocale: 'en',
            locales:['en'],
            updateFiles: false,
            directory: '/var/searchntalk/localization',
            objectNotation: true
        });
    })();

    /* Getters */
    static get(key:string, data?:Object, locale:string = 'en'):string {
        if (locale)
            return i18n.__({'phrase': key, 'locale': locale}, data);
        return i18n.__(key);
    }

    /* Setters */
    static setLocale(locale:string) {
        i18n.setLocale(locale);
    }
}
export = LocalizationDelegate