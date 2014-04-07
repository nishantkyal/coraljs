///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import UserPhone                                            = require('../models/UserPhone');

interface ISmsProvider
{
    sendSMS(to:string, body:string, from?:string):q.Promise<any>;
    sendSMS(to:UserPhone, body:string, from?:string):q.Promise<any>;
}
export = ISmsProvider