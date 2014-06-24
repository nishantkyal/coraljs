/*
 * Created by Ankit on 14/02/14.
 */
import BaseModel                = require('./BaseModel');
import Schedule                 = require('./Schedule');
import MoneyUnit                = require('../enums/MoneyUnit');
import Utils                    = require('../common/Utils');

class ScheduleException extends Schedule
{
    static TABLE_NAME = 'expert_schedule_exception';

    static USER_ID:string       = 'user_id';

    private user_id:number;

    /* Getters */
    getUserId():number                 { return this.user_id; }

    /* Setters */
    setUserId(val:number):void         { this.user_id = val; }

    isValid():boolean
    {
        return super.isValid()
                    && !Utils.isNullOrEmpty(this.getUserId());
    }
}
export = ScheduleException