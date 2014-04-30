///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserEmploymentDao                                    = require('../dao/UserEmploymentDao');
import MapProfileEmploymentDao                              = require('../dao/MapProfileEmploymentDao');
import UserEmployment                                       = require('../models/UserEmployment');
import MapProfileEmployment                                 = require('../models/MapProfileEmployment');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEmploymentDao()); }

    createUserEmployment(userEmployment:UserEmployment, profileId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var mapProfileEmploymentDao = new MapProfileEmploymentDao();
        return self.create(userEmployment,transaction)
            .then(function userEmploymentCreated(emp){
                var mapProfileEmployment:MapProfileEmployment = new MapProfileEmployment();
                mapProfileEmployment.setEmploymentId(emp.id);
                mapProfileEmployment.setProfileId(profileId);
                return mapProfileEmploymentDao.create(mapProfileEmployment,transaction);
            })
    }
}
export = UserEmploymentDelegate