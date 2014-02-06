import BaseDao                  = require('./BaseDAO');
import BaseModel                = require('../models/BaseModel');
import PhoneNumber              = require('../models/PhoneNumber');

class PhoneNumberDao extends BaseDao
{
    getModel():typeof BaseModel { return PhoneNumber; }
}
export = PhoneNumber