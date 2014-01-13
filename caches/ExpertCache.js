
var CacheHelper = require('./CacheHelper');

var ExpertCache = (function () {
    function ExpertCache() {
    }
    /*
    * Get information required to render expert widget
    * Ratings, pricing
    * @param expertId
    */
    ExpertCache.prototype.getWidgetProfile = function (expertId) {
        return CacheHelper.get(expertId);
    };
    return ExpertCache;
})();

module.exports = ExpertCache;

//# sourceMappingURL=ExpertCache.js.map
