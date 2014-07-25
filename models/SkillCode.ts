import BaseModel                                      = require('./BaseModel');

class SkillCode extends BaseModel
{
    static TABLE_NAME:string = 'skill_codes';

    static COL_SKILL:string = 'skill';

    static DEFAULT_FIELDS:string[] = [SkillCode.COL_ID, SkillCode.COL_SKILL];

    private skill:string;

    /* Getters */
    getSkill():string                               { return this.skill; }

    /* Setters */
    setSkill(val:string):void                       { this.skill = val; }
}
export = SkillCode


