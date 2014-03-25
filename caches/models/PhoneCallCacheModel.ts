import PhoneType        = require('../../enums/PhoneType');

class PhoneCallCacheModel
{
    private call_id:number;
    private caller_user_id:number;
    private integration_member_id:number;
    private userNumber:string;
    private userPhoneType:PhoneType;
    private expertNumber:string;
    private expertPhoneType:PhoneType;
    private start_time:number;
    private duration:number;
    private status:number;
    private recorded:boolean;
    private extension:string;
    private num_reattempts:number;
    private delay:number;
    private expertName:string;

    /* Getters */
    getCallId():number              { return this.call_id; }
    getCallerUserId():number        { return this.caller_user_id; }
    getIntegrationMemberId():number { return this.integration_member_id; }
    getUserNumber():string          { return this.userNumber; }
    getUserPhoneType():PhoneType    { return this.userPhoneType; }
    getExpertNumber():string        { return this.expertNumber; }
    getExpertPhoneType():PhoneType  { return this.expertPhoneType; }
    getStartTime():number           { return this.start_time; }
    getDuration():number            { return this.duration; }
    getStatus():number              { return this.status; }
    getRecorded():boolean           { return this.recorded; }
    getExtension():string           { return this.extension; }
    getNumReattempts():number       { return this.num_reattempts; }
    getDelay():number               { return this.delay; }
    getExpertName():string          { return this.expertName; }

    /* Setters */
    setCallId(val:number):void                  { this.call_id = val; }
    setCallerUserId(val:number):void            { this.caller_user_id = val; }
    setIntegrationMemberId(val:number):void     { this.integration_member_id = val; }
    setUserNumber(val:string):void              { this.userNumber = val; }
    setUserPhoneType(val:PhoneType):void        { this.userPhoneType = val; }
    setExpertNumber(val:string):void            { this.expertNumber = val; }
    setExpertPhoneType(val:PhoneType):void      { this.expertPhoneType = val; }
    setStartTime(val:number):void               { this.start_time = val; }
    setDuration(val:number):void                { this.duration = val; }
    setStatus(val:number):void                  { this.status = val; }
    setRecorded(val:boolean):void               { this.recorded = val; }
    setExtension(val:string):void               { this.extension = val; }
    setNumReattempts(val:number):void           { this.num_reattempts = val; }
    setDelay(val:number):void                   { this.delay = val; }
    setExpertName(val:string):void              { this.expertName = val; }

    constructor(val?:any)
    {
        if(val)
        {
            this.setCallId(val.call_id);
            this.setCallerUserId(val.caller_user_id);
            this.setIntegrationMemberId(val.integration_member_id);
            this.setUserNumber(val.userNumber);
            this.setUserPhoneType(val.userPhoneType == 1 ? PhoneType.MOBILE :PhoneType.LANDLINE);
            this.setExpertNumber(val.expertNumber);
            this.setExpertPhoneType(val.expertPhoneType);
            this.setStartTime(val.start_time);
            this.setDuration(val.duration);
            this.setStatus(val.status);
            this.setRecorded(val.recorded);
            this.setExtension(val.extension);
            this.setNumReattempts(val.num_reattempts);
            this.setDelay(val.delay);
            this.setExpertName(val.expertName);
        }
    }
}
export = PhoneCallCacheModel