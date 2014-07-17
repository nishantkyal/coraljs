import BaseModel                                      = require('./BaseModel');

class SkillCode extends BaseModel
{
    static TABLE_NAME:string = 'skill_codes';

    static SKILL:string = 'skill';

    static DEFAULT_FIELDS:string[] = [SkillCode.ID, SkillCode.SKILL];

    private skill:string;

    /* Getters */
    getSkill():string                               { return this.skill; }

    /* Setters */
    setSkill(val:string):void                       { this.skill = val; }
}
export = SkillCode


