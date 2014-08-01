///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import WidgetExpert                                         = require('../models/WidgetExpert');
import Schedule                                             = require('../models/Schedule');
import User                                                 = require('../models/User');
import CacheHelper                                          = require('./CacheHelper');
import Utils                                                = require('../common/Utils');
import CacheHelperFactory                                   = require('../factories/CacheHelperFactory');
import CacheHelperType                                      = require('../enums/CacheHelperType');

interface CachedExpert
{
    user;
    schedules;
}

class WidgetExpertCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);

    get(id:number):q.Promise<WidgetExpert>
    {
        return this.cacheHelper.getFromHash('widget-experts', id)
            .then(
            function widgetExpertFetched(result:CachedExpert)
            {
                if (Utils.isNullOrEmpty(result))
                    return null;
                return new WidgetExpert(new User(result.user), _.map(JSON.parse(result.schedules), function(scheduleObj:Object) {return new Schedule(scheduleObj); }));
            });
    }

    save(expert:User, schedules:Schedule[]):q.Promise<any>
    {
        return CacheHelper.addToHash('widget-experts', expert.getId(), {user: expert, schedules: schedules});
    }
}
export = WidgetExpertCache