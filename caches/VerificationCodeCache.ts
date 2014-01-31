///<reference path='../_references.d.ts'/>
///<reference path='./CacheHelper.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../common/Config.ts'/>

module caches
{
    export class VerificationCodeCache
    {
        createMobileVerificationCode():Q.IPromise<any>
        {
            var codeReference:string = common.Utils.getRandomString(8);
            var code:number = common.Utils.getRandomInt(1001, 9999);
            var secondsInAnHr:number = 60 * 60;
            return CacheHelper.set('mv-' + codeReference , code, secondsInAnHr)
                .then(
                    function tokenCreated() { return {code: code, ref: codeReference}}
                );
        }
    
        searchMobileVerificationCode(code:string, ref:string):Q.IPromise<any>
        {
            return CacheHelper.get('mv-' + ref)
                .then(
                function tokenSearched(result) {
                    return {isValid: result == code};
                }
            );
        }
    }
}