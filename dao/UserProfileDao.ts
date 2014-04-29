///<reference path='../_references.d.ts'/>
import AbstractDao                                      = require('./AbstractDao');
import UserProfile                                      = require('../models/UserProfile');

class UserProfileDao extends AbstractDao
{
    constructor() { super(UserProfile); }
}
export = UserProfileDao