import AbstractDao              = require('./AbstractDao');
import BaseModel                = require('../models/BaseModel');
import User                     = require('../models/User');

class UserDao extends AbstractDao
{
    constructor() { super(User); }
}
export = UserDao