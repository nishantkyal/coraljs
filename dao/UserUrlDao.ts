import AbstractDao                          = require('./AbstractDao');
import BaseModel                            = require('../models/BaseModel');
import UserUrl                              = require('../models/UserUrl');

class UserUrlDao extends AbstractDao
{
    constructor() { super(UserUrl); }
}
export = UserUrlDao