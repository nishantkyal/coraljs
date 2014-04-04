import BaseModel                                      = require('./BaseModel');

class RefSkillCode extends BaseModel
{
    static TABLE_NAME:string = 'skill_codes';

    static SKILL:string = 'skill';
    static LKIN_CODE:string = 'lkin_code';

    private skill:string;
    private lkin_code:number;
    /* Getters */
    getSkill():string           { return this.skill; }
    getLkinCode():number        { return this.lkin_code; }

    /* Setters */
    setSkill(val:string):void   { this.skill = val; }
    setLkinCode(val:number):void{ this.lkin_code = val; }
}
export = RefSkillCode


