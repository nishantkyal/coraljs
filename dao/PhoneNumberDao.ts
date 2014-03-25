import BaseDao                  = require('../dao/BaseDao');
import BaseModel                = require('../models/BaseModel');
import UserPhone              = require('../models/UserPhone');

class UserPhoneDao extends BaseDao
{
    constructor() { super(UserPhone); }
}
export = UserPhoneDao