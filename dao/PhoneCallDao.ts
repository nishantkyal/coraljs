import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import PhoneCall                = require('../models/PhoneCall');

/**
 DAO for phone calls
 **/
class PhoneCallDao extends BaseDao
{
    getModel():typeof BaseModel { return PhoneCall; }
}
export = PhoneCallDao