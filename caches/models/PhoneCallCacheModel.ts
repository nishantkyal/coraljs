
class PhoneCallCacheModel
{
    private caller_user_id:number;
    private integration_member_id:number;
    private caller_phone_id:number;
    private expert_phone_id:number;
    private start_time:number;
    private duration:number;
    private status:number;
    private recorded:boolean;
    private extension:string;
    private num_reattempts:number;
    private delay:number;

    /* Getters */
    getCallerUserId():number { return this.caller_user_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getCallerPhoneId():number { return this.caller_phone_id; }
    getExpertPhoneId():number { return this.expert_phone_id; }
    getStartTime():number { return this.start_time; }
    getDuration():number { return this.duration; }
    getStatus():number { return this.status; }
    getRecorded():boolean{ return this.recorded; }
    getExtension():string { return this.extension; }
    getNumReattempts():number { return this.num_reattempts; }
    getDelay():number { return this.delay; }

    /* Setters */
    setCallerUserId(val:number):void { this.caller_user_id = val; }
    setIntegrationMemberId(val:number):void { this.integration_member_id = val; }
    setCallerPhoneId(val:number):void { this.caller_phone_id = val; }
    setExpertPhoneId(val:number):void { this.expert_phone_id = val; }
    setStartTime(val:number):void { this.start_time = val; }
    setDuration(val:number):void { this.duration = val; }
    setStatus(val:number):void { this.status = val; }
    setRecorded(val:boolean):void { this.recorded = val; }
    setExtension(val:string):void { this.extension = val; }
    setNumReattempts(val:number):void {this.num_reattempts = val; }
    setDelay(val:number):void {this.delay = val; }
}
export = PhoneCallCacheModel