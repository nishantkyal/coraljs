///<reference path='../_references.d.ts'/>
import _                                            = require('underscore');
import q                                            = require('q');
import request                                      = require('request');
import BaseDaoDelegate                              = require('./BaseDaoDelegate');
import IDao                                         = require('../dao/IDao');
import SkillCodeDao                                 = require('../dao/SkillCodeDao');
import Utils                                        = require('../common/Utils');

class SkillCodeDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new SkillCodeDao(); }

    getSkillCodeFromLinkedIn(skillName:string):q.Promise<any>
    {
        var deferred = q.defer();
        var url:string = ('http://www.linkedin.com/ta/skill?query=' + skillName);

        request(url, function codeFetched(error, response:any, body:any)
        {
            if (!Utils.isNullOrEmpty(error))
                deferred.reject(error);
            else
            {
                var dataJson = JSON.parse(body);
                var resultList = dataJson.resultList;
                var skillCode = _.findWhere(resultList, {displayName: skillName});
                deferred.resolve(skillCode);
            }
        });

        return deferred.promise;
    }
}
export = SkillCodeDelegate