import IntegrationMemberRole            = require('../enums/IntegrationMemberRole');
import CacheHelperFactory                               = require('../factories/CacheHelperFactory');
import CacheHelperType                                  = require('../enums/CacheHelperType');
class IntegrationMemberCache
{
    /* Get member's role for integration */
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);
    getMemberRole(integrationId:string, userId:string)
    {

    }
}
export = IntegrationMemberCache