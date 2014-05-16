import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import CallFragmentDao              = require('../dao/CallFragmentDao');
import CallFragment                 = require('../models/CallFragment');
import AgentType                    = require('../enums/AgentType');
import CallFragmentStatus           = require('../enums/CallFragmentStatus');
import Config                       = require('../common/Config');
import Utils                        = require('../common/Utils');
import CallProviderFactory          = require('../factories/CallProviderFactory');

class CallFragmentDelegate extends BaseDaoDelegate
{
    callProviderFactory = new CallProviderFactory();

    constructor() { super(new CallFragmentDao()); }

    getTotalDuration(callId:number, transaction?:Object):q.Promise<any>
    {
        var callFragmentDao:any = this.dao;
        return callFragmentDao.getTotalDuration(callId, transaction);
    }

    saveCallFragment(callFragment:CallFragment)
    {
        var self = this;
        self.callProviderFactory.getProvider().updateCallFragment(callFragment);
    }
}
export = CallFragmentDelegate