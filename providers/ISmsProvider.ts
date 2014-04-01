///<reference path='../_references.d.ts'/>
import q                                                    = require('q');

interface ISmsProvider
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>;
}
export = ISmsProvider