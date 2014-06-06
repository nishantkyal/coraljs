import q                                                = require('q');
import TimeZone                                         = require('../enums/TimeZone');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');

class TimezoneDelegate
{
    getTimezone(timezoneId:TimeZone):q.Promise<any>
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
}
export = TimezoneDelegate