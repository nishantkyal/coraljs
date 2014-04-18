///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import q                                        = require('q');
import Config                                   = require('../common/Config');
import CacheHelper                              = require('./CacheHelper');
import Utils                                    = require('../common/Utils');
import IntegrationMember                        = require('../models/IntegrationMember');

class VerificationCodeCache
{
    createEmailVerificationCode(email:string, code?:string):q.Promise<any>
    {
        code = code || Utils.getRandomString(20);
        var secondsInThreeDays:number = 60 * 60 * 24 * 3;
        return CacheHelper.set('ev-' + email, code, secondsInThreeDays)
            .then(
            function codeCreated() { return code; }
        );
    }

    searchEmailVerificationCode(email:string, code:string):q.Promise<boolean>
    {
        return CacheHelper.get('ev-' + email)
            .then(
            function tokenSearched(result)
            {
                return result == code;
            });
    }

    deleteEmailVerificationCode(email:string):q.Promise<any>
    {
        return CacheHelper.del('ev-' + email);
    }

    createPasswordResetCode(userId:number, code?:string):q.Promise<any>
    {
        code = code || Utils.getRandomString(20);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('pr-' + userId, code, secondsInAnHr)
            .then(
            function codeCreated() { return code; }
        );
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

    createInvitationCode(integrationId:number, member:IntegrationMember, code?:string):q.Promise<string>
    {
        code = code || Utils.getRandomString(20, 'ABXDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');

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
        return CacheHelper.getHash('ic-' + integrationId);
    }

    createMobileVerificationCode(phoneNumber:string, code?:string):q.Promise<any>
    {
        var code:string = code || Utils.getRandomInt(1001, 9999);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('mv-' + phoneNumber, code, secondsInAnHr, true)
            .then(
            function codeSaved() { return code; }
        );
    }

    searchMobileVerificationCode(code:string, phoneNumber:string):q.Promise<boolean>
    {
        return CacheHelper.get('mv-' + phoneNumber)
            .then(
            function tokenSearched(result)
            {
                return result == code;
            }
        );
    }

    createAppointmentAcceptCode(callId:number, code:string, startTimes:number[]):q.Promise<any>
    {
        return CacheHelper.set('aa-' + code, {id: callId, startTimes: startTimes});
    }

    searchAppointmentAcceptCode(code:string):q.Promise<any>
    {
        return CacheHelper.get('aa-' + code);
    }
}
export = VerificationCodeCache