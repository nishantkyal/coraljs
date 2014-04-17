import AbstractDao                  = require('./AbstractDao');
import BaseModel                    = require('../models/BaseModel');
import UserPhone                    = require('../models/UserPhone');

class UserPhoneDao extends AbstractDao
{
    constructor() { super(UserPhone); }
}
export = UserPhoneDao