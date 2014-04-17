///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserProfileDao                                       = require('../dao/UserProfileDao');

class UserProfileDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserProfileDao()); }
}
export = UserProfileDelegate