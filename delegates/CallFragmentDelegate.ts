import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import CallFragmentDao              = require('../dao/CallFragmentDao');
import CallFragment                 = require('../models/CallFragment');
import AgentType                    = require('../enums/AgentType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');
import CallProviderFactory          = require('../factories/CallProviderFactory');

class CallFragmentDelegate extends BaseDaoDelegate
{


    getDao():IDao { return new CallFragmentDao();}

    getTotalDuration(callId:number, transaction?:any):q.Promise<any>
    {
        return this.getDao().getTotalDuration(callId, transaction);
    }

    updateCallFragment(callFragment:CallFragment):q.Promise<any>
    {
        return new CallProviderFactory().getProvider().updateCallFragment(callFragment);
    }

    updateCallFragmentStartTime(callFragment:CallFragment):q.Promise<any>
    {
        return new CallProviderFactory().getProvider().updateCallFragmentStartTime(callFragment);
    }
}
export = CallFragmentDelegate