///<reference path='../_references.d.ts'/>
///<reference path='./CacheHelper.ts'/>

module caches
{
    export class ExpertCache
    {
        /* Get information required to render expert widget e.g. Ratings, pricing */
        getWidgetProfile(expertId:string):Q.Promise<any>
        {
            return CacheHelper.get(expertId);
        }

    }
}