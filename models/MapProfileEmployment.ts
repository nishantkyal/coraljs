import AbstractModel            = require('./AbstractModel');

class MapProfileEmployment extends AbstractModel
{
    static TABLE_NAME:string = 'map_profile_employment';

    static PROFILE_ID:string = 'profile_id';
    static EMPLOYMENT_ID:string = 'employment_id';

    private profile_id:number;
    private employment_id:number;

    getProfileId():number               { return this.profile_id; }
    getEmploymentId():number            { return this.employment_id; }

    setProfileId(val:number)            { this.profile_id = val; }
    setEmploymentId(val:number)         { this.employment_id = val; }
}
export = MapProfileEmployment