///<reference path='../../_references.d.ts'/>

module delegates
{
    export interface ICallingVendorDelegate
    {
        sendSMS(to:string, body:string, from?:string):Q.Promise<any>;
        makeCall(phone:string, url?:string):Q.Promise<any>;
    }
}