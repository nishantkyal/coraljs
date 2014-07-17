import BaseModel            = require('./BaseModel');
import SkillCode            = require('./SkillCode');
import ForeignKey           = require('./ForeignKey');


class MapExpertiseSkill extends BaseModel
{
    static TABLE_NAME:string = 'map_expertise_skill';

    static EXPERTISE_ID:string = 'expertise_id';
    static SKILL_ID:string = 'skill_id';

    constructor(data:Object = {})
    {
        super(data);
        if (!MapExpertiseSkill._INITIALIZED)
        {
            this.hasOne(new ForeignKey(MapExpertiseSkill.SKILL_ID, SkillCode, SkillCode.ID));
            MapExpertiseSkill._INITIALIZED = true;
        }
    }

    static DEFAULT_FIELDS:string[] = [MapExpertiseSkill.ID,  MapExpertiseSkill.EXPERTISE_ID, MapExpertiseSkill.SKILL_ID];

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
