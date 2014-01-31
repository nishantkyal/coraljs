///<reference path='../_references.d.ts'/>

/**
 Delegate to manage localization
 **/
module delegates
{
    export class LocalizationDelegate
    {
        /** Static constructor workaround */
        private static ctor = (() =>
        {
            i18n.configure({
                defaultLocale: 'en',
                locales:['en'],
                directory: '/var/searchntalk/localization'
            });
        })();

        /** Getters **/
        static get(key:string, locale?:string):string {
            if (locale)
                return i18n.__({'phrase': key, 'locale': locale});
            return i18n.__(key);
        }

        /** Setters **/
        static setLocale(locale:string) {
            i18n.setLocale(locale);
        }
    }
}