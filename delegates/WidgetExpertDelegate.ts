import q                                                    = require('q');
import WidgetExpert                                         = require('../models/WidgetExpert');
import IntegrationMember                                    = require('../models/IntegrationMember');
import WidgetExpertCache                                    = require('../caches/WidgetExpertCache');
import IntegrationMemberDelegate                            = require('../delegates/IntegrationMemberDelegate');
import Utils                                                = require('../common/Utils');
import IncludeFlag                                          = require('../enums/IncludeFlag');

class WidgetExpertDelegate
{
    private widgetExpertCache = new WidgetExpertCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();

    get(expertId:number):q.Promise<any>
    {
        var self = this;

        return self.widgetExpertCache.get(expertId)
            .then(
            function widgetExpertFetchedFromCache(widgetExpert:WidgetExpert)
            {
                if (Utils.isNullOrEmpty(widgetExpert))
                    throw('Not found in cache');
                return widgetExpert;
            })
            .fail(
            function widgetExpertFetchFailed():any
            {
                return self.integrationMemberDelegate.get(expertId, null, [IncludeFlag.INCLUDE_USER]);
            })
            .then(
            function expertFetched(expert:IntegrationMember):any
            {
                var widgetExpert = new WidgetExpert(expert);
                self.widgetExpertCache.save(widgetExpert);
                return widgetExpert;
            });
    }

}
export = WidgetExpertDelegate