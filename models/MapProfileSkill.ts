import AbstractModel            = require('./AbstractModel');

class MapProfileSkill extends AbstractModel
{
    static TABLE_NAME:string = 'map_profile_skill';

    static PROFILE_ID:string = 'profile_id';
    static SKILL_ID:string = 'skill_id';

    private profile_id:number;
    private skill_id:number;

    getProfileId():number           { return this.profile_id; }
    getSkillId():number             { return this.skill_id; }

    setProfileId(val:number)        { this.profile_id = val; }
    setSkillId(val:number)          { this.skill_id = val; }
}
export = MapProfileSkill