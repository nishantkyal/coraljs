///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                               = require('./BaseDaoDelegate');
import UserUrlDao                                    = require('../dao/UserUrlDao');
import UserUrl                                       = require('../models/UserUrl');

class UserUrlDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserUrlDao()); }
}
export = UserUrlDelegate