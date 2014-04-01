///<reference path='../_references.d.ts'/>
import express                                              = require('express');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserEducationDao                                     = require('../dao/UserEducationDao');
import UserEducation                                        = require('../models/UserEducation');
import ApiConstants                                         = require('../enums/ApiConstants');

class UserEducationDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [UserEducation.ID, UserEducation.USER_ID,UserEducation.START_YEAR, UserEducation.END_YEAR, UserEducation.DEGREE,
        UserEducation.FIELD_OF_STUDY, UserEducation.SCHOOL_NAME, UserEducation.ACTIVITIES, UserEducation.NOTES];
    getDao():IDao { return new UserEducationDao(); }

}
export = UserEducationDelegate
