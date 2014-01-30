import q                = require('q');

interface ICallingVendorDelegate
{
    sendSMS(to:string, body:string, from?:string):q.makePromise;
    makeCall(phone:string, url?:string):q.makePromise;
}
export = ICallingVendorDelegate