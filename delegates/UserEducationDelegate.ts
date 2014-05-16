///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import UserEducationDao                                     = require('../dao/UserEducationDao');
import MapProfileEducationDao                               = require('../dao/MapProfileEducationDao');
import UserEducation                                        = require('../models/UserEducation');
import MapProfileEducation                                  = require('../models/MapProfileEducation');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class UserEducationDelegate extends BaseDaoDelegate
{
    private integrationMemberDelegate;

    constructor()
    {
        super(new UserEducationDao());
        var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
        this.integrationMemberDelegate = new IntegrationMemberDelegate();
    }

    createUserEducation(userEducation:UserEducation, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var mapProfileEducationDao = new MapProfileEducationDao();

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.create(userEducation,transaction)
            .then(
            function userEducationCreated(edu){
                var mapProfileEducation:MapProfileEducation = new MapProfileEducation();
                mapProfileEducation.setEducationId(edu.id);
                mapProfileEducation.setProfileId(profileId);
                return mapProfileEducationDao.create(mapProfileEducation,transaction);
            });
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return super.getIncludeHandler(include, result);
    }
}
export = UserEducationDelegate