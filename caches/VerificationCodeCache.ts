import q                    = require('q');
import Config               = require('../Config');
import CacheHelper          = require('./CacheHelper');
import Utils                = require('../Utils');

class VerificationCodeCache
{
    createMobileVerificationCode():q.makePromise
    {
        var codeReference:string = Utils.getRandomString(8);
        var code:number = Utils.getRandomInt(1001, 9999);
        var secondsInAnHr:number = 60 * 60;
        return CacheHelper.set('mv-' + codeReference , code, secondsInAnHr)
            .then(
                function tokenCreated() { return {code: code, ref: codeReference}}
            );
    }

    searchMobileVerificationCode(code:string, ref:string):q.makePromise
    {
        return CacheHelper.get('mv-' + ref)
            .then(
            function tokenSearched(result) {
                return {isValid: result == code};
            }
        );
    }
}
export = VerificationCodeCache