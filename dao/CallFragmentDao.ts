import q                        = require('q');
import BaseDao                  = require('./BaseDao');
import BaseModel                = require('../models/BaseModel');
import CallFragment             = require('../models/CallFragment');
import MysqlDelegate            = require('../delegates/MysqlDelegate');
import CallFragmentStatus       = require('../enums/CallFragmentStatus');

/**
 * DAO class for CallFragment queue
 */
class CallFragmentDao extends BaseDao
{
    getModel():typeof BaseModel { return CallFragment; }

    getTotalDuration(callId:number, transaction?:any):q.Promise<any>
    {
        var query = 'SELECT SUM(duration) as totalDuration FROM ' +  this.getModel().TABLE_NAME
                    + ' WHERE call_id = ' + callId
                    + ' AND call_fragment_status = ' + CallFragmentStatus.SUCCESS
                    + ' GROUP BY duration';

        return MysqlDelegate.executeQuery(query, null, transaction);
    }

}
export = CallFragmentDao