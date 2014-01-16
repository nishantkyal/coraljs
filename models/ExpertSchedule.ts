import BaseModel            = require('../models/BaseModel');

class ExpertSchedule extends BaseModel
{
    static TABLE_NAME:string = 'expert_schedule';
    static PRIMARY_KEY:string = 'schedule_id';

    private schedule_id:string;
    private schedule_rule_id:number;
    private integration_member_id:number;
    private start_time:number;
    private duration:number;
    private active:boolean;

    /* Getters */
    getScheduleId():string { return this.schedule_id; }
    getScheduleRuleId():number { return this.schedule_rule_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getActive():boolean { return this.active; }

    /* Setters */
    setScheduleId(val:string):void { this.schedule_id = val; }
    setScheduleRuleId(val:number):void { this.schedule_rule_id = val; }
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setActive(val:boolean):void { this.active = val; }

}
export = ExpertSchedule