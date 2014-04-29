import q                                        = require('q');
import AbstractMappingDao                       = require('./AbstractMappingDao');
import BaseModel                                = require('../models/BaseModel');
import UserEducation                            = require('../models/UserEducation');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');


class UserEducationDao extends AbstractMappingDao
{
    constructor() { super(UserEducation); }
}
export = UserEducationDao