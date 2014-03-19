import BaseDao                  = require('../dao/BaseDao');
import BaseModel                = require('../models/BaseModel');
import PhoneNumber              = require('../models/PhoneNumber');

class PhoneNumberDao extends BaseDao
{
    constructor() { super(PhoneNumber); }
}
export = PhoneNumberDao