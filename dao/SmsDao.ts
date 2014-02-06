import BaseDao              = require('./BaseDao');
import BaseModel            = require('../models/BaseModel');
import SMS                  = require('../models/SMS');

class SmsDao extends BaseDao
{
    getModel():typeof BaseModel { return SMS; }
}
export = SmsDao