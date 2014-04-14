///<reference path='../_references.d.ts'/>
import BaseDao                                          = require('./BaseDao');
import BaseModel                                        = require('../models/BaseModel');
import UserProfile                                      = require('../models/UserProfile');

class UserProfileDao extends BaseDao
{
    constructor() { super(UserProfile); }
}
export = UserProfileDao