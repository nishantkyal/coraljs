import _                                            = require('underscore');
import q                                            = require('q');
import BaseDaoDelegate                              = require('../delegates/BaseDaoDelegate');
import SkillCodeDelegate                            = require('../delegates/SkillCodeDelegate');
import MapExpertiseSkill                            = require('../models/MapExpertiseSkill');
import SkillCode                                    = require('../models/SkillCode');
import IncludeFlag                                  = require('../enums/IncludeFlag');


class MapExpertiseSkillDelegate extends BaseDaoDelegate
{
    skillCodeDelegate = new SkillCodeDelegate();

    constructor()
    {
        super(MapExpertiseSkill);
    }

    getIncludeHandler(include:IncludeFlag, result:any):q.Promise<any>
    {
        var self = this;

        switch (include)
        {
            case IncludeFlag.INCLUDE_SKILL:
                return self.skillCodeDelegate.get(_.uniq(_.pluck(result, MapExpertiseSkill.SKILL_ID)));

        }
        return super.getIncludeHandler(include, result);
    }
}
export = MapExpertiseSkillDelegate