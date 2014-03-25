///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserEducationDao                                     = require('../dao/UserEducationDao');

class UserEducationDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new UserEducationDao(); }
}
export = UserEducationDelegate
