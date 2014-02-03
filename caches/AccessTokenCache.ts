///<reference path='../_references.d.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../common/Config.ts'/>
///<reference path='./CacheHelper.ts'/>
/**
 * Token cache
 * For quick access to oauth access token and related details
 */
module caches
{
    export class AccessTokenCache
    {
        /* Get details for token (integration, user id) */
        getAccessTokenDetails(token:string):Q.Promise<any>
        {
            return caches.CacheHelper.get('at-' + token);
        }

        /* Add token to cache */
        addToken(integrationMember:models.IntegrationMember, expireAfter:number = common.Config.get('access_token.expiry')):Q.Promise<any>
        {
            return null;
        }

        /** Remove token from cache **/
            removeToken(token:string):Q.Promise<any>
        {
            return null;
        }

    }
}