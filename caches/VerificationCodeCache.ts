import q                    = require('q');
import Config               = require('../common/Config');
import CacheHelper          = require('./CacheHelper');
import Utils                = require('../common/Utils');

class VerificationCodeCache
{
    createMobileVerificationCode():q.Promise<any>
    {
        var codeReference:string = Utils.getRandomString(8);
        var code:number = Utils.getRandomInt(1001, 9999);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('mv-' + codeReference , code, secondsInAnHr)
            .then(
                function tokenCreated() { return {code: code, ref: codeReference}}
            );
    }

    searchMobileVerificationCode(code:string, ref:string):q.Promise<any>
    {
        return CacheHelper.get('mv-' + ref)
            .then(
            function tokenSearched(result) {
                return {isValid: result == code};
            }
        );
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
            function tokenSearched(result) {
                return {isValid: result == code};
            }
        );
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
            function tokenSearched(result) {
                return {isValid: result == code};
            }
        );
    }
}
export = VerificationCodeCache