///<reference path='../_references.d.ts'/>
import q                                        = require('q');
import BaseDao                                  = require('./BaseDao');
import BaseModel                                = require('../models/BaseModel');
import PhoneCall                                = require('../models/PhoneCall');

/*
 DAO for phone calls
 */
class PhoneCallDao extends BaseDao
{
    constructor() { super(PhoneCall); }

    getCallsBetweenInterval(startTime:number, endTime:number):q.Promise<any>
    {
        var searchQuery = {
            'start_time' :{
                'operator': 'between',
                'value': [startTime, endTime]
            }
        };
        return this.search(searchQuery);
    }
}
export = PhoneCallDao