import q                                                        = require('q');
import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import CacheHelperFactory                                       = require('../factories/CacheHelperFactory');
import SaveStats                                                = require('../models/SaveStats');
import SaveStatsTaskType                                        = require('../enums/SaveStatsTaskType');
import CacheHelperType                                          = require('../enums/CacheHelperType');
import Utils                                                    = require('../common/Utils');

class SaveStatsDelegate extends BaseDaoDelegate
{
    constructor() { super(SaveStats); }

    incrementCounter(counterName:string):q.Promise<any>
    {
        var tasks = [];
        for (var key in SaveStatsTaskType)
        {
            var value = SaveStatsTaskType[key];
            if (Utils.getObjectType(value) == 'String')
                tasks.push(CacheHelperFactory.getCacheHelper(CacheHelperType.STATS_CACHE_HELPER).incrementCounter(counterName + '_' + value.toLowerCase()));
        }

        return q.all(tasks);
    }
}
export = SaveStatsDelegate