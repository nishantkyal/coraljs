///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import UserEducation                                        = require('../models/UserEducation');
import MapProfileEducation                                  = require('../models/MapProfileEducation');
import Utils                                                = require('../common/Utils');

class UserEducationDelegate extends BaseDaoDelegate
{
    constructor() { super(UserEducation); }
}
export = UserEducationDelegate