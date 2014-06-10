import q                                                = require('q');
import _                                                = require('underscore');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');

class TimezoneDelegate
{
    static currentOffsets;
    getTimezone(timezoneId):q.Promise<any>
    {
        var query:string = 'SELECT z.country_code, z.zone_name, tz.abbreviation, tz.gmt_offset, tz.dst ' +
            'FROM `timezone` tz JOIN `zone` z ' +
            'ON tz.zone_id=z.zone_id ' +
            'WHERE z.zone_id = ? ' +
            'AND tz.time_start < UNIX_TIMESTAMP(UTC_TIMESTAMP()) ' +
            'ORDER BY tz.time_start DESC LIMIT 1;';

        return MysqlDelegate.executeQuery(query, [timezoneId])
            .then(
            function zoneFetched(result:Object[])
            {
                return result && result.length == 1 ? result[0] : null;
            });
    }

    getCurrentOffsets():q.Promise<any>
    {
        var query:string = 'SELECT z.zone_id, max(tz.time_start), z.zone_name, tz.gmt_offset, tz.dst ' +
            'FROM `timezone` tz JOIN `zone` z ' +
            'ON tz.zone_id=z.zone_id ' +
            'WHERE tz.time_start < UNIX_TIMESTAMP(UTC_TIMESTAMP()) ' +
            'GROUP BY z.zone_id;';

        return MysqlDelegate.executeQuery(query)
            .then(
            function zoneFetched(result:Object[])
            {
                TimezoneDelegate.currentOffsets = _.sortBy(result, function(zone:any){ return zone.gmt_offset});
            });
    }
}
export = TimezoneDelegate