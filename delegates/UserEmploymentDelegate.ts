///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import UserEmployment                                       = require('../models/UserEmployment');
import MapProfileEmployment                                 = require('../models/MapProfileEmployment');
import Utils                                                = require('../common/Utils');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    constructor() { super(UserEmployment); }
}
export = UserEmploymentDelegate