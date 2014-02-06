import q                = require('q');

interface ICallingVendorDelegate
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>;
    makeCall(phone:string, url?:string):q.Promise<any>;
}
export = ICallingVendorDelegate