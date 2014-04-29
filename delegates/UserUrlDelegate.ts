///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import UserUrlDao                                    = require('../dao/UserUrlDao');
import MapProfileUrlDao                              = require('../dao/MapProfileUrlDao');
import UserUrl                                       = require('../models/UserUrl');
import MapProfileUrl                                 = require('../models/MapProfileUrl');

class UserUrlDelegate extends BaseDaoDelegate
{
    constructor() { super(new UserUrlDao()); }

    createUserUrl(userUrl:UserUrl, profileId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var mapProfileUrlDao = new MapProfileUrlDao();
        return self.create(userUrl,transaction)
            .then(function userUrlCreated(emp:UserUrl){
                var mapProfileUrl:MapProfileUrl = new MapProfileUrl();
                mapProfileUrl.setUrlId(emp.getId());
                mapProfileUrl.setProfileId(profileId);
                return mapProfileUrlDao.create(mapProfileUrl,transaction);
            })
    }
}
export = UserUrlDelegate