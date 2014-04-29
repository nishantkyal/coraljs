///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import WidgetExpert                                         = require('../models/WidgetExpert');
import CacheHelper                                          = require('./CacheHelper');
import Utils                                                = require('../common/Utils');

class WidgetExpertCache
{
    get(id:number):q.Promise<WidgetExpert>
    {
        return CacheHelper.getFromHash('widget-experts', id)
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