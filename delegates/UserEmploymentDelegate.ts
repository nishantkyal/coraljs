///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserEmploymentDao                                    = require('../dao/UserEmploymentDao');
import UserEmployment                                       = require('../models/UserEmployment');
import MapProfileEmployment                                 = require('../models/MapProfileEmployment');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEmploymentDao()); }

    createUserEmployment(userEmployment:UserEmployment, profileId:number):q.Promise<any>
    {
        return null;
    }
}
export = UserEmploymentDelegate