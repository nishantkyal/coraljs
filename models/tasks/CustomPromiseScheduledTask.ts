///<reference path='../../_references.d.ts'/>
import q                                                            = require('q');
import AbstractScheduledTask                                        = require('./AbstractScheduledTask');
import Utils                                                        = require('../../common/Utils');

class CustomPromiseScheduledTask extends AbstractScheduledTask
{
    private function:(...args)=>q.Promise<any>;
    private args:any[];

    getFunction():(...args)=>q.Promise<any> { return this.function; }
    getArgs():any[] { return this.args; }

    setFunction(val:(...args)=>q.Promise<any>) { this.function = val; }
    setArgs(val:any[]) { this.args = val; }

    execute():q.Promise<any>
    {
        return this.getFunction().apply(this, this.getArgs());
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.getFunction());
    }
}
export = CustomPromiseScheduledTask