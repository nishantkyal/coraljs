///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserProfileDao                                       = require('../dao/UserProfileDao');

class UserProfileDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserProfileDao()); }
}
export = UserProfileDelegate