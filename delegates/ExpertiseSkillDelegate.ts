import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import ExpertiseSkillDao            = require('../dao/ExpertiseSkillDao');


class ExpertiseSkillDelegate extends BaseDaoDelegate
{
    constructor() { super(new ExpertiseSkillDao()); }
}
export = ExpertiseSkillDelegate