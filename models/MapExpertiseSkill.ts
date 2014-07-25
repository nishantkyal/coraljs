import BaseModel            = require('./BaseModel');
import SkillCode            = require('./SkillCode');
import ForeignKey           = require('./ForeignKey');


class MapExpertiseSkill extends BaseModel
{
    static TABLE_NAME:string = 'map_expertise_skill';

    static COL_EXPERTISE_ID:string = 'expertise_id';
    static COL_SKILL_ID:string = 'skill_id';

    static DEFAULT_FIELDS:string[] = [MapExpertiseSkill.COL_ID,  MapExpertiseSkill.COL_EXPERTISE_ID, MapExpertiseSkill.COL_SKILL_ID];

    constructor(data:Object = {})
    {
        super(data);
        if (!MapExpertiseSkill._INITIALIZED)
        {
            this.hasOne(new ForeignKey(MapExpertiseSkill.COL_SKILL_ID, SkillCode, SkillCode.COL_ID));
            MapExpertiseSkill._INITIALIZED = true;
        }
    }

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
