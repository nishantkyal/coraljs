import BaseModel                                      = require('./BaseModel');

class UserSkillDetail extends BaseModel
{
    static TABLE_NAME:string = 'user_skill';

    static USER_ID:string = 'user_id';
    static SKILL:string = 'skill';

    private user_id:number;
    private skill:number;

    /* Getters */
    getUserId():number { return this.user_id; }
    getSkill():number { return this.skill; }

    /* Setters */
    setUserId(val:number):void { this.user_id = val; }
    setSkill(val:number):void { this.skill = val; }
}
export = UserSkillDetail