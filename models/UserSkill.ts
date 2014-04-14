import BaseModel                                      = require('./BaseModel');

class UserSkill extends BaseModel
{
    static TABLE_NAME:string = 'user_skill';

    static USER_ID:string = 'user_id';
    static SKILL_ID:string = 'skill_id';

    static DEFAULT_FIELDS:string[] = [UserSkill.ID, UserSkill.USER_ID,UserSkill.SKILL_ID];

    private user_id:number;
    private skill_id:number;

    /* Getters */
    getUserId():number { return this.user_id; }
    getSkillId():number { return this.skill_id; }

    /* Setters */
    setUserId(val:number):void { this.user_id = val; }
    setSkillId(val:number):void { this.skill_id = val; }
}
export = UserSkill