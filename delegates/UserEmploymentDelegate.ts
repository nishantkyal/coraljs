///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('../delegates/BaseDaoDelegate');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import MapProfileEmploymentDao                              = require('../dao/MapProfileEmploymentDao');
import UserEmployment                                       = require('../models/UserEmployment');
import MapProfileEmployment                                 = require('../models/MapProfileEmployment');
import Utils                                                = require('../common/Utils');

class UserEmploymentDelegate extends BaseDaoDelegate
{
    constructor() { super(UserEmployment); }
    private mapProfileEmploymentDao = new MapProfileEmploymentDao();

    createUserEmployment(userEmployment:UserEmployment, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.create(userEmployment, transaction)
            .then(
            function userEmploymentCreated(emp)
            {
                var mapProfileEmployment:MapProfileEmployment = new MapProfileEmployment();
                mapProfileEmployment.setEmploymentId(emp.id);
                mapProfileEmployment.setProfileId(profileId);

                return self.mapProfileEmploymentDao.create(mapProfileEmployment, transaction);
            });
    }
}
export = UserEmploymentDelegate