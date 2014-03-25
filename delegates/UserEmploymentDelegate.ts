///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserEmploymentDao                                   = require('../dao/UserEmploymentDao');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new UserEmploymentDao(); }
}
export = UserEmploymentDelegate