///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import q                                                = require('q');
import request                                          = require('request');
import BaseDaoDelegate                                  = require('./BaseDaoDelegate');
import SkillCodeDao                                     = require('../dao/SkillCodeDao');
import SkillCode                                        = require('../models/SkillCode');
import Utils                                            = require('../common/Utils');

class SkillCodeDelegate extends BaseDaoDelegate
{
    constructor() { super(new SkillCodeDao()); }

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
                var matchingSkillCode:number = _.findWhere(resultList, {displayName: skillName})['id'];

                var skillCode = new SkillCode();
                skillCode.setLinkedinCode(matchingSkillCode);
                skillCode.setSkill(skillName);

                deferred.resolve(skillCode);
            }
        });

        return deferred.promise;
    }

    createSkillCodeFromLinkedIn(skillName:string, transaction?:any):q.Promise<any>
    {
        var self = this;
        var skillNames = [].concat(skillName);
        return self.getSkillCodeFromLinkedIn(skillName)
            .then(
            function skillCodesFetched(skillCode:SkillCode)
            {
                return self.create(skillCode, transaction)
                    .fail(
                    function skillCodeCreationFailed(error)
                    {
                        self.logger.debug('Error creating skill code from linkedin code, error: %s', error);
                        return self.find({skill: skillName});
                    });
            })
    }
}
export = SkillCodeDelegate