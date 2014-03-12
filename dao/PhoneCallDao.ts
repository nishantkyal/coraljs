import q                        = require('q');
import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import PhoneCall                = require('../models/PhoneCall');

/**
 DAO for phone calls
 **/
class PhoneCallDao extends BaseDao
{
    getModel():typeof BaseModel { return PhoneCall; }
    getCallsBetweenInterval(startTime:number, endTime:number):q.Promise<any>
    {
        var search = {
            'start_time' :{
                'operator': 'between',
                'value': [startTime, endTime]
            }
        };
        return this.search(search);
    }
}
export = PhoneCallDao