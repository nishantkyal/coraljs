import q                                                = require('q');
import _                                                = require('underscore');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');

class TimezoneDelegate
{
    static TIMEZONES:Object[];

    getTimezone(timezoneId:number):Object
    {
        return _.findWhere(TimezoneDelegate.TIMEZONES, {'zone_id': timezoneId});
    }

    updateTimezoneCache():q.Promise<any>
    {
        var query:string = 'SELECT z.zone_id, current_tz.time_start, z.zone_name, current_tz.gmt_offset, current_tz.dst ' +
            'FROM zone z,( ' +
            'SELECT tz.* ' +
            'FROM timezone tz, ' +
            '(SELECT zone_id, MAX(time_start) time_start ' +
            'FROM `timezone`  ' +
            'WHERE time_start < UNIX_TIMESTAMP(UTC_TIMESTAMP()) ' +
            'GROUP BY zone_id ' +
            ') max_tz ' +
            'WHERE tz.zone_id = max_tz.zone_id ' +
            'AND tz.time_start = max_tz.time_start) current_tz ' +
            'WHERE z.zone_id = current_tz.zone_id ' +
            'ORDER BY z.zone_id;';

        return MysqlDelegate.executeQuery(query)
            .then(
            function zoneFetched(result:Object[])
            {
                TimezoneDelegate.TIMEZONES = result;
                _.extend(_, {Timezone: result});
                return TimezoneDelegate.TIMEZONES;
            });
    }
}
export = TimezoneDelegate