import BaseModel                                      = require('./BaseModel');

class UserSkill extends BaseModel
{
    static TABLE_NAME:string = 'user_skill';

    static SKILL_ID:string = 'skill_id';

    static DEFAULT_FIELDS:string[] = [UserSkill.ID,UserSkill.SKILL_ID];

    private skill_id:number;

    /* Getters */
    getSkillId():number { return this.skill_id; }

    /* Setters */
    setSkillId(val:number):void { this.skill_id = val; }
}
export = UserSkill