///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserEducationDao                                     = require('../dao/UserEducationDao');
import MapProfileEducationDao                               = require('../dao/MapProfileEducationDao');
import UserEducation                                        = require('../models/UserEducation');
import ApiConstants                                         = require('../enums/ApiConstants');

class UserEducationDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEducationDao()); }

    createUserEducation(userEducation:UserEducation, profileId:number):q.Promise<any>
    {

    }

}
export = UserEducationDelegate
