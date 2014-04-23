import AbstractModel            = require('./AbstractModel');

class MapProfileEducation extends AbstractModel
{
    static TABLE_NAME:string = 'map_profile_education';

    static PROFILE_ID:string = 'profile_id';
    static EDUCATION_ID:string = 'education_id';

    private profile_id:number;
    private education_id:number;

    getProfileId():number           { return this.profile_id; }
    getEducationId():number         { return this.education_id; }

    setProfileId(val:number)        { this.profile_id = val; }
    setEducationId(val:number)      { this.education_id = val; }
}
export = MapProfileEducation