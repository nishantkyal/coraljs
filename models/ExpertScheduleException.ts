/**
 * Created by Ankit on 14/02/14.
 */
import BaseModel                = require('./BaseModel');
import MoneyUnit                = require('../enums/MoneyUnit');
import Utils                    = require('../common/Utils');

class ExpertScheduleException extends BaseModel
{
    static TABLE_NAME = 'expert_schedule_exception';

    private integration_member_id:number;
    private schedule_rule_id:number;
    private start_time:number;
    private duration:number;

    /* Getters */
    getIntegrationMemberId():number     { return this.integration_member_id; }
    getScheduleRuleId():number          { return this.schedule_rule_id; }
    getStartTime():number               { return this.start_time; }
    getDuration():number                { return this.duration; }

    /* Setters */
    setIntegrationMemberId(val:number):void     { this.integration_member_id = val; }
    setScheduleRuleId(val:number):void          { this.schedule_rule_id = val; }
    setStartTime(val:number):void               { this.start_time = val; }
    setDuration(val:number):void                { this.duration = val; }

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getStartTime())
            || !Utils.isNullOrEmpty(this.getScheduleRuleId())
            || !Utils.isNullOrEmpty(this.getDuration())
            || !Utils.isNullOrEmpty(this.getIntegrationMemberId());
    }
}
export = ExpertScheduleException