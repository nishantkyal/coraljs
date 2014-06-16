import _                                                        = require('underscore');
import q                                                        = require('q');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');
import moment                                                   = require('moment');

class PrintTimestampTask extends AbstractScheduledTask
{
    static ts:string = 'ts';

    private ts:number;

    constructor(ts:number)
    {
        super();
        this.ts = ts;
        this.setTaskType(ScheduledTaskType.TEST_TIMESTAMP_PRINT);
    }

    execute():q.Promise<any>
    {
        console.log(this.ts + ' current time =  ', moment().valueOf());
        return q.resolve('');
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.ts);
    }

    toJson():Object
    {
        return _.extend(super.toJson(), {ts:this.ts});
    }
}
export = PrintTimestampTask
