import AbstractMappingDao                   = require('./AbstractMappingDao');
import BaseModel                            = require('../models/BaseModel');
import UserUrl                              = require('../models/UserUrl');

class UserUrlDao extends AbstractMappingDao
{
    constructor() { super(UserUrl); }
}
export = UserUrlDao