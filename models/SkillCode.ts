import BaseModel                                      = require('./BaseModel');

class RefSkillCode extends BaseModel
{
    static TABLE_NAME:string = 'skill_codes';

    static SKILL:string = 'skill';
    static LINKEDIN_CODE:string = 'linkedin_code';

    private skill:string;
    private linkedin_code:number;

    /* Getters */
    getSkill():string                               { return this.skill; }
    getLinkedinCode():number                        { return this.linkedin_code; }

    /* Setters */
    setSkill(val:string):void                       { this.skill = val; }
    setLinkedinCode(val:number):void                { this.linkedin_code = val; }
}
export = RefSkillCode


