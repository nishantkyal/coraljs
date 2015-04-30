var i18n = require('i18n');
var LocalizationDelegate = (function () {
    function LocalizationDelegate() {
    }
    LocalizationDelegate.get = function (key, data, locale) {
        if (locale === void 0) { locale = 'en'; }
        if (locale)
            return i18n.__({ 'phrase': key, 'locale': locale }, data);
        return i18n.__(key);
    };
    LocalizationDelegate.setLocale = function (locale) {
        i18n.setLocale(locale);
    };
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