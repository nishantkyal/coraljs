import BaseModel                                            = require('./BaseModel');
import SkillCode                                            = require('./SkillCode');
import ForeignKey                                           = require('./ForeignKey');
import ForeignKeyType                                       = require('../enums/ForeignKeyType');

class MapExpertiseSkill extends BaseModel
{
    static TABLE_NAME:string = 'map_expertise_skill';

    static COL_EXPERTISE_ID:string = 'expertise_id';
    static COL_SKILL_ID:string = 'skill_id';

    static PUBLIC_FIELDS:string[] = [MapExpertiseSkill.COL_ID,  MapExpertiseSkill.COL_EXPERTISE_ID, MapExpertiseSkill.COL_SKILL_ID];

    static FK_EXPERTISE_SKILL = new ForeignKey(ForeignKeyType.ONE_TO_ONE, MapExpertiseSkill.COL_SKILL_ID, SkillCode, SkillCode.COL_ID);

    private expertise_id:number;
    private skill_id:number;

    getExpertiseId():number             { return this.expertise_id; }
    getSkillId():number                 { return this.skill_id; }
    getSkill():SkillCode                { return null; }

    setExpertiseId(val:number)          { this.expertise_id = val; }
    setSkillId(val:number)              { this.skill_id = val; }
    setSkill(val:SkillCode)             { }
}
export = MapExpertiseSkill
