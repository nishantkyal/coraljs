import q                                                                = require('q');
import AbstractScheduledTask                                            = require('./AbstractScheduledTask');
import Utils                                                            = require('../../common/Utils');

class CustomScheduledTask extends AbstractScheduledTask
{
    private function:Function;
    private args:any[];

    getFunction():Function { return this.function; }
    getArgs():any[] { return this.args; }

    setFunction(val:Function) { this.function = val; }
    setArgs(val:any[]) { this.args = val; }

    execute():q.Promise<any>
    {
        var deferred = q.defer();
        try {
            deferred.resolve(this.getFunction().apply(this, this.getArgs()));
        } catch (e) {
            deferred.reject(e);
        }
        return deferred.promise;
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.getFunction());
    }

}
export = CustomScheduledTask