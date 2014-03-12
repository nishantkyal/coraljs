///<reference path='../_references.d.ts'/>
import q                                        = require('q');
import Config                                   = require('../common/Config');
import CacheHelper                              = require('./CacheHelper');
import Utils                                    = require('../common/Utils');
import IntegrationMember                        = require('../models/IntegrationMember');

class VerificationCodeCache
{
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

    createInvitationCode(integrationId:number, member:IntegrationMember):q.Promise<string>
    {
        var code = Utils.getRandomString(20, 'ABXDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');
        return CacheHelper.addToHash('ic-' + integrationId, code, member)
            .then(
            function codeCreated() { return code; }
        );
    }

    searchInvitationCode(code:string, integrationId:number):q.Promise<any>
    {
        return CacheHelper.getFromHash('ic-' + integrationId, code)
            .then(
            function invitationCodeSearched(invitedUser)
            {
                if (Utils.isNullOrEmpty(invitedUser))
                    throw('Invalid invitation code');
                else
                    return invitedUser;
            }
        );
    }

    deleteInvitationCode(code:string, integrationId:number):q.Promise<any>
    {
        return CacheHelper.delFromHash('ic-' + integrationId, code);
    }

    getInvitationCodes(integrationId:number):q.Promise<any>
    {
        return CacheHelper.getHashValues('ic-' + integrationId);
    }


}
export = VerificationCodeCache