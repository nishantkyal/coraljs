import BaseModel            = require('../models/BaseModel');

class Schedule extends BaseModel
{
    private schedule_id:string;
    private integration_member_id:number;
    private active:boolean;

    /* Getters */
    getScheduleId():string { return this.schedule_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getIsActive():boolean { return this.active; }

    /* Setters */
    setScheduleId(val:string):void { this.schedule_id = val; }
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setIsActive(val:boolean):void { this.active = val; }

}
export = Schedule