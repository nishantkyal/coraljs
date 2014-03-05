/*
 * Created by Ankit on 14/02/14.
 */
import BaseModel                = require('./BaseModel');
import ExpertSchedule           = require('./ExpertSchedule');
import MoneyUnit                = require('../enums/MoneyUnit');
import Utils                    = require('../common/Utils');

class ExpertScheduleException extends ExpertSchedule
{
    static TABLE_NAME = 'expert_schedule_exception';

    private integration_member_id:number;

    /* Getters */
    getIntegrationMemberId():number                 { return this.integration_member_id; }

    /* Setters */
    setIntegrationMemberId(val:number):void         { this.integration_member_id = val; }

    isValid():boolean
    {
        return super.isValid()
                    && !Utils.isNullOrEmpty(this.getIntegrationMemberId());
    }
}
export = ExpertScheduleException