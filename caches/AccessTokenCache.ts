import q                                                = require('q');
import IntegrationMember                                = require('../models/IntegrationMember');
import Config                                           = require('../common/Config');
import CacheHelperFactory                               = require('../factories/CacheHelperFactory');
import CacheHelperType                                  = require('../enums/CacheHelperType');

/*
 * Token cache
 * For quick access to oauth access token and related details
 */
class AccessTokenCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);
    /* Get details for token (integration, user id) */
    getAccessTokenDetails(token:string):q.Promise<any>
    {
        return this.cacheHelper.get('at-' + token);
    }

    /* Add token to cache */
    addToken(integrationMember:IntegrationMember, expireAfter:number = Config.get(Config.ACCESS_TOKEN_EXPIRY)):q.Promise<any>
    {
        return null;
    }

    /* Remove token from cache */
    removeToken(token:string):q.Promise<any>
    {
        return null;
    }

}
export = AccessTokenCache