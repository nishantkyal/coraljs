import q                    = require('q');
import Config               = require('../common/Config');
import CacheHelper          = require('./CacheHelper');
import Utils                = require('../common/Utils');
import User                 = require('../models/User');

class VerificationCodeCache
{
    createMobileVerificationCode():q.Promise<any>
    {
        var codeReference:string = Utils.getRandomString(8);
        var code:number = Utils.getRandomInt(1001, 9999);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('mv-' + codeReference, code, secondsInAnHr)
            .then(
            function tokenCreated() { return codeReference; }
        );
    }

    searchMobileVerificationCode(code:string, ref:string):q.Promise<any>
    {
        var actualCode:string;
        return CacheHelper.get('mv-' + ref)
            .then(
            function invalidateToken(result)
            {
                actualCode = result;
                return CacheHelper.del('mv-' + ref);
            })
            .then(
            function validateCode()
            {
                return actualCode == code;
            });
    }

    createEmailVerificationCode(userId:number):q.Promise<any>
    {
        var code:string = Utils.getRandomString(20);
        var secondsInThreeDays:number = 60 * 60 * 24 * 3;
        return CacheHelper.set('ev-' + userId, code, secondsInThreeDays);
    }

    searchEmailVerificationCode(userId:number, code:string):q.Promise<any>
    {
        return CacheHelper.get('ev-' + userId)
            .then(
            function tokenSearched(result)
            {
                return {isValid: result == code};
            });
    }

    createPasswordResetCode(userId:number):q.Promise<any>
    {
        var code:string = Utils.getRandomString(20);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('pr-' + userId, code, secondsInAnHr);
    }

    searchPasswordResetCode(userId:number, code:string):q.Promise<any>
    {
        return CacheHelper.get('pr-' + userId)
            .then(
            function tokenSearched(result)
            {
                return {isValid: result == code};
            });
    }

    createInvitationCode(integrationId:number, user:User):q.Promise<any>
    {
        var code = Utils.getRandomString(20, 'ABXDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');
        return CacheHelper.addToHash('ic-' + integrationId, code, user)
            .then(
            function codeCreated() { return code; }
        );
    }

    searchInvitationCode(code:string, integrationId:number):q.Promise<any>
    {
        return CacheHelper.getFromHash('ic-' + integrationId, code);
    }
}
export = VerificationCodeCache