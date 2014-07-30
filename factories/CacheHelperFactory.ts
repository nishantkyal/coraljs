import CacheHelper                  = require('../caches/CacheHelper');
import CacheHelperType              = require('../enums/CacheHelperType');
import Config                       = require('../common/Config');

class CacheHelperFactory
{
    private static cacheHelper = new CacheHelper(Config.get(Config.REDIS_VERIFICATION_PORT));
    private static counterCacheHelper = new CacheHelper(Config.get(Config.REDIS_COUNTER_PORT));

    static getCacheHelper(type:CacheHelperType):CacheHelper
    {
        switch(type)
        {
            case CacheHelperType.CACHE_HELPER:
                return CacheHelperFactory.cacheHelper;

            case CacheHelperType.COUNTER_CACHE_HELPER:
                return CacheHelperFactory.counterCacheHelper;

            default:
                return null;
        }
    }
}
export = CacheHelperFactory