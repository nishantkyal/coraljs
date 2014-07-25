import BaseModel                                        = require('./BaseModel');
import SkillCode                                        = require('./SkillCode');
import ForeignKey                                       = require('./ForeignKey');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');

class UserSkill extends BaseModel
{
    static TABLE_NAME:string = 'user_skill';

    static COL_SKILL_ID:string = 'skill_id';
    static COL_USER_ID:string = 'user_id';

    static PUBLIC_FIELDS:string[] = [UserSkill.COL_ID, UserSkill.COL_SKILL_ID, UserSkill.COL_USER_ID];

    static FK_SKILL_CODE:ForeignKey = new ForeignKey(ForeignKeyType.ONE_TO_ONE, UserSkill.COL_SKILL_ID, SkillCode, SkillCode.COL_ID);

    private skill_id:number;
    private user_id:number;

    /* Getters */
    getSkillId():number             { return this.skill_id; }
    getUserId():number              { return this.user_id; }

    getSkill():SkillCode                { return null; }
    /* Setters */
    setSkillId(val:number):void     { this.skill_id = val; }
    setUserId(val:number):void      { this.user_id = val; }

    setSkill(val:SkillCode)             { }
}
export = UserSkill