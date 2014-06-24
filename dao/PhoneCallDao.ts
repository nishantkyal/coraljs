import q                                                    = require('q');
import _                                                    = require('underscore');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import AbstractDao                                          = require('./AbstractDao');
import BaseModel                                            = require('../models/BaseModel');
import PhoneCall                                            = require('../models/PhoneCall');

/*
 DAO for phone calls
 */
class PhoneCallDao extends AbstractDao
{
    constructor() { super(PhoneCall); }
}
export = PhoneCallDao