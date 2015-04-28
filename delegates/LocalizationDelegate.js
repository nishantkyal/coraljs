///<reference path='../_references.d.ts'/>
var i18n = require('i18n');
/*
 Delegate to manage localization
 */
var LocalizationDelegate = (function () {
    function LocalizationDelegate() {
    }
    /* Getters */
    LocalizationDelegate.get = function (key, data, locale) {
        if (locale === void 0) { locale = 'en'; }
        if (locale)
            return i18n.__({ 'phrase': key, 'locale': locale }, data);
        return i18n.__(key);
    };
    /* Setters */
    LocalizationDelegate.setLocale = function (locale) {
        i18n.setLocale(locale);
    };
    /* Static constructor workaround */
    LocalizationDelegate.ctor = (function () {
        i18n.configure({
            defaultLocale: 'en',
            locales: ['en'],
            updateFiles: false,
            directory: '/var/searchntalk/localization',
            objectNotation: true
        });
    })();
    return LocalizationDelegate;
})();
module.exports = LocalizationDelegate;
//# sourceMappingURL=LocalizationDelegate.js.map