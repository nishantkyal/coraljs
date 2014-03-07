import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import CallFragmentDao              = require('../dao/CallFragmentDao')

class CallFragment extends BaseDaoDelegate
{
    getDao():IDao { return new CallFragmentDao();}

    getTotalDuration(callId:number, transaction?:any):q.Promise<any>
    {
        return this.getDao().getTotalDuration(callId, transaction);
    }
}
export = CallFragment