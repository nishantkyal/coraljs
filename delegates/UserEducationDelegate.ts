///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import BaseDaoDelegate                                      = require('./BaseDaoDelegate');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import UserEducation                                        = require('../models/UserEducation');
import MapProfileEducation                                  = require('../models/MapProfileEducation');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class UserEducationDelegate extends BaseDaoDelegate
{
    constructor()
    {
        super(UserEducation);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        return super.getIncludeHandler(include, result);
    }
}
export = UserEducationDelegate