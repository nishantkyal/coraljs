import q                                                = require('q');
import _                                                = require('underscore');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');
import Timezone                                         = require('../models/Timezone');

class TimezoneDelegate
{
    static TIMEZONES:Timezone[];

    get(timezoneId:number):Timezone
    {
        return _.findWhere(TimezoneDelegate.TIMEZONES, {'zone_id': timezoneId});
    }

    getZoneByOffset(offset:number):Timezone
    {
        return _.findWhere(TimezoneDelegate.TIMEZONES, {'gmt_offset': offset});
    }

    updateTimezoneCache():q.Promise<any>
    {
        var query:string = 'SELECT z.zone_id, current_tz.time_start, z.zone_name, current_tz.gmt_offset, current_tz.dst, z.country_code ' +
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
            'ORDER BY current_tz.gmt_offset;';

        return MysqlDelegate.executeQuery(query)
            .then(
            function zoneFetched(result:Object[])
            {
                TimezoneDelegate.TIMEZONES = _.map(result, function(obj) { return new Timezone(obj); });
                _.extend(_, {Timezone: result});
                return TimezoneDelegate.TIMEZONES;
            });
    }
}
export = TimezoneDelegate