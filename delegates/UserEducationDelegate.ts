///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserEducationDao                                     = require('../dao/UserEducationDao');
import UserEducation                                        = require('../models/UserEducation');
import ApiConstants                                         = require('../enums/ApiConstants');

class UserEducationDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEducationDao()); }

}
export = UserEducationDelegate
