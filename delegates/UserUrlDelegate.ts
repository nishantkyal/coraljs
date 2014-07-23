///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserUrl                                              = require('../models/UserUrl');
import MapProfileUrl                                        = require('../models/MapProfileUrl');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import Utils                                                = require('../common/Utils');

class UserUrlDelegate extends BaseDaoDelegate
{
    constructor() { super(UserUrl); }
}
export = UserUrlDelegate