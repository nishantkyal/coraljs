///<reference path='../_references.d.ts'/>
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import IDao                                                 = require('../dao/IDao');
import UserEmploymentDao                                    = require('../dao/UserEmploymentDao');
import UserEmployment                                       = require('../models/UserEmployment');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    DEFAULT_FIELDS:string[] = [UserEmployment.ID,  UserEmployment.USER_ID,UserEmployment.TITLE, UserEmployment.SUMMARY, UserEmployment.START_DATE,
        UserEmployment.END_DATE, UserEmployment.IS_CURRENT,UserEmployment.COMPANY];
    getDao():IDao { return new UserEmploymentDao(); }
}
export = UserEmploymentDelegate