import q                    = require('q');
import IntegrationMember    = require('../models/IntegrationMember');
import Config               = require('../Config');
import CacheHelper          = require('./CacheHelper');

/**
 * Token cache
 * For quick access to oauth access token and related details
 */
class AccessTokenCache
{
    /* Get details for token (integration, user id) */
    getAccessTokenDetails(token:string):q.makePromise
    {
        return CacheHelper.get('at-' + token);
    }

    /* Add token to cache */
    addToken(integrationMember:IntegrationMember, expireAfter:number = Config.get('access_token.expiry')):q.makePromise
    {
        return null;
    }

    /** Remove token from cache **/
    removeToken(token:string):q.makePromise
    {
        return null;
    }

}
export = AccessTokenCache