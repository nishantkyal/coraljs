///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import WidgetExpert                                         = require('../models/WidgetExpert');
import Utils                                                = require('../common/Utils');
import CacheHelperFactory                                   = require('../factories/CacheHelperFactory');
import CacheHelperType                                      = require('../enums/CacheHelperType');

class WidgetExpertCache
{
    private cacheHelper = CacheHelperFactory.getCacheHelper(CacheHelperType.CACHE_HELPER);

    get(id:number):q.Promise<WidgetExpert>
    {
        return this.cacheHelper.getFromHash('widget-experts', id)
            .then(
            function widgetExpertFetched(result:Object)
            {
                if (Utils.isNullOrEmpty(result))
                    return null;
                return new WidgetExpert(result);
            });
    }

    save(expert:WidgetExpert):q.Promise<any>
    {
        return null;
    }
}
export = WidgetExpertCache