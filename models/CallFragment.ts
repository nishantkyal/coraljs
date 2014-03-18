import BaseModel            = require('./BaseModel');
import Utils                = require('../common/Utils');

class CallFragment extends BaseModel
{
    static TABLE_NAME:string = 'call_fragment';

    private call_id:number;
    private start_time:number;
    private duration:number;
    private from_number:string;
    private to_number:string;
    private agent_id:number;
    private agent_call_sid_user:number;
    private agent_call_sid_expert:number;
    private call_fragment_status:number;
    private response_code:number;

    /* Getters */
    getCallId():number              { return this.call_id; }
    getStartTime():number           { return this.start_time; }
    getDuration():number            { return this.duration; }
    getFromNumber():string          { return this.from_number; }
    getToNumber():string            { return this.to_number; }
    getAgentId():number             { return this.agent_id; }
    getAgentCallSidUser():number    { return this.agent_call_sid_user; }
    getAgentCallSidExpert():number  { return this.agent_call_sid_expert; }
    getCallFragmentStatus():number  { return this.call_fragment_status; }
    getResponseCode():number        { return this.response_code; }

    /* Setters */
    setCallId(val:number):void              { this.call_id = val; }
    setStartTime(val:number):void           { this.start_time = val; }
    setDuration(val:number):void            { this.duration = val; }
    setFromNumber(val:string):void          { this.from_number = val; }
    setToNumber(val:string):void            { this.to_number = val; }
    setAgentId(val:number):void             { this.agent_id = val; }
    setAgentCallSidUser(val:number):void    { this.agent_call_sid_user = val; }
    setAgentCallSidExpert(val:number):void  { this.agent_call_sid_expert = val; }
    setCallFragmentStatus(val:number):void  { this.call_fragment_status = val; }
    setResponseCode(val:number):void        { this.response_code = val; }

    isValid():boolean
    {
        return (!Utils.isNullOrEmpty(this.getCallId()));
    }
}
export = CallFragment