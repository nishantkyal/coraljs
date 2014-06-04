import q                                                = require('q');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');

class TimezoneDelegate
{
    getTimezone(zoneName:string):q.Promise<any>
    {
        var query:string = 'SELECT z.country_code, z.zone_name, tz.abbreviation, tz.gmt_offset, tz.dst ' +
            'FROM `timezone` tz JOIN `zone` z ' +
            'ON tz.zone_id=z.zone_id ' +
            'WHERE tz.time_start < UNIX_TIMESTAMP(UTC_TIMESTAMP()) AND z.zone_name = ? ' +
            'ORDER BY tz.time_start DESC LIMIT 1;';

        return MysqlDelegate.executeQuery(query, [zoneName]);
    }
}
export = TimezoneDelegate