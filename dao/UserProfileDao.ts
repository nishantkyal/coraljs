///<reference path='../_references.d.ts'/>
import BaseDao                                          = require('./BaseDao');
import BaseModel                                        = require('../models/BaseModel');
import UserProfile                                      = require('../models/UserProfile');

class UserProfileDao extends BaseDao
{
    getModel():typeof BaseModel { return UserProfile; }
}
export = UserProfileDao