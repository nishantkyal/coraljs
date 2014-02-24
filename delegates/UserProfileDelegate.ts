///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserProfileDao                                       = require('../dao/UserProfileDao');

class UserProfileDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new UserProfileDao(); }
}
export = UserProfileDelegate