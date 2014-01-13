var i18n = require('i18n');

/**
Delegate to manage localization
**/
var LocalizationDelegate = (function () {
    function LocalizationDelegate() {
    }
    LocalizationDelegate.get = /** Getters **/
    function (key, locale) {
        if (locale)
            return i18n.__({ 'phrase': key, 'locale': locale });
        return i18n.__(key);
    };

    LocalizationDelegate.setLocale = /** Setters **/
    function (locale) {
        i18n.setLocale(locale);
    };
    LocalizationDelegate.ctor = (function () {
        i18n.configure({
            defaultLocale: 'en',
            locales: ['en'],
            directory: '/var/searchntalk/localization'
        });
    })();
    return LocalizationDelegate;
})();

module.exports = LocalizationDelegate;

//# sourceMappingURL=LocalizationDelegate.js.map
