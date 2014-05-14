import q                                                = require('q');
import AbstractDao                                      = require('./AbstractDao');
import BaseModel                                        = require('../models/BaseModel');
import CallFragment                                     = require('../models/CallFragment');
import MysqlDelegate                                    = require('../delegates/MysqlDelegate');
import CallFragmentStatus                               = require('../enums/CallFragmentStatus');

/**
 * DAO class for CallFragment queue
 */
class CallFragmentDao extends AbstractDao
{
    constructor() { super(CallFragment) }

    getTotalDuration(callId:number, transaction?:Object):q.Promise<any>
    {
        var query = 'SELECT SUM(duration) as totalDuration FROM ' +  this.modelClass.TABLE_NAME
                    + ' WHERE call_id = ' + callId
                    + ' AND call_fragment_status = ' + CallFragmentStatus.SUCCESS;

        return MysqlDelegate.executeQuery(query, null, transaction);
    }

}
export = CallFragmentDao