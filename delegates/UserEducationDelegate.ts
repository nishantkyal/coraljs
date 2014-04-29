///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserEducationDao                                    = require('../dao/UserEducationDao');
import MapProfileEducationDao                              = require('../dao/MapProfileEducationDao');
import UserEducation                                       = require('../models/UserEducation');
import MapProfileEducation                                 = require('../models/MapProfileEducation');

class UserEducationDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserEducationDao()); }

    createUserEducation(userEducation:UserEducation, profileId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var mapProfileEducationDao = new MapProfileEducationDao();
        return self.create(userEducation,transaction)
            .then(function userEducationCreated(emp:UserEducation){
                var mapProfileEducation:MapProfileEducation = new MapProfileEducation();
                mapProfileEducation.setEducationId(emp.getId());
                mapProfileEducation.setProfileId(profileId);
                return mapProfileEducationDao.create(mapProfileEducation,transaction);
            })
    }
}
export = UserEducationDelegate