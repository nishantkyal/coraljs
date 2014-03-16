import BaseDao                  = require('../dao/BaseDao');
import BaseModel                = require('../models/BaseModel');
import PhoneNumber              = require('../models/PhoneNumber');

class PhoneNumberDao extends BaseDao
{
    getModel():typeof BaseModel { return PhoneNumber; }
}
export = PhoneNumberDao