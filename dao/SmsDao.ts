import BaseDAO              = require('./BaseDAO');
import BaseModel            = require('../models/BaseModel');
import SMS                  = require('../models/SMS');

class SmsDao extends BaseDAO
{
    getModel():typeof BaseModel { return SMS; }
}
export = SmsDao