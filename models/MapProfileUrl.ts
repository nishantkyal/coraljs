import AbstractModel            = require('./AbstractModel');

class MapProfileUrl extends AbstractModel
{
    static TABLE_NAME:string = 'map_profile_url';

    static PROFILE_ID:string = 'profile_id';
    static URL_ID:string = 'url_id';

    private profile_id:number;
    private url_id:number;

    getProfileId():number           { return this.profile_id; }
    getUrlId():number               { return this.url_id; }

    setProfileId(val:number)        { this.profile_id = val; }
    setUrlId(val:number)            { this.url_id = val; }
}
export = MapProfileUrl