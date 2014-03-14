import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import Email                    = require('../models/Email');

/*
 * DAO class for Email queue
 */
class EmailDao extends BaseDao
{
    getModel():typeof BaseModel { return Email; }
}
export = EmailDao