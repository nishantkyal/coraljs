///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserEmploymentDao                                    = require('../dao/UserEmploymentDao');
import UserEmployment                                       = require('../models/UserEmployment');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEmploymentDao()); }
}
export = UserEmploymentDelegate