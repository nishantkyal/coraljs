import q                                                    = require('q');
import _                                                    = require('underscore');
import MysqlDelegate                                        = require('../delegates/MysqlDelegate');
import AbstractDao                                          = require('./AbstractDao');
import BaseModel                                            = require('../models/BaseModel');
import PhoneCall                                            = require('../models/PhoneCall');

/*
 DAO for phone calls
 */
class PhoneCallDao extends AbstractDao
{
    constructor() { super(PhoneCall); }

    /* Get existing calls that conflict with the new call details we're trying to create */
    getCallsWithTimeConflict(startTime:number, duration:number, expertId:number, dbTransaction?:Object):q.Promise<any>
    {
        var query = 'SELECT * ' +
            'FROM ' + this.tableName + ' ' +
            'WHERE ' + PhoneCall.INTEGRATION_MEMBER_ID + ' = ? ' +
            'AND ' + PhoneCall.START_TIME + ' BETWEEN ? AND ? ' +
            'OR ' + PhoneCall.START_TIME + ' BETWEEN (? - ' + PhoneCall.DURATION + ') AND (? - ' + PhoneCall.DURATION + ')';
        var values = [expertId, startTime, startTime + duration, startTime, startTime + duration]

        return MysqlDelegate.executeQuery(query, values, dbTransaction)
            .then(
            function callsFetched(result:Object[])
            {
                return _.map(result, function(result) {
                    return new PhoneCall(result);
                });
            });
    }
}
export = PhoneCallDao