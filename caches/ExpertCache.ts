import q                                                = require('q');
import CacheHelperFactory                               = require('../factories/CacheHelperFactory');
import CacheHelperType                                  = require('../enums/CacheHelperType');

class ExpertCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);
    /*
     * Get information required to render expert widget
     * Ratings, pricing
     * @param expertId
     */
    getWidgetProfile(expertId:string):q.Promise<any>
    {
        return this.cacheHelper.get(expertId);
    }

}
export = ExpertCache