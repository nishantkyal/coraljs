///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import IDao                         = require('../dao/IDao');
import ExpertScheduleExceptionDao   = require('../dao/ExpertScheduleExceptionDao');
import ExpertScheduleRule           = require('../models/ExpertScheduleRule');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');

class ExpertScheduleExceptionDelegate extends BaseDaoDelegate
{
    getDao():IDao { return new ExpertScheduleExceptionDao();}
    getExceptionsbyRuleId(options, ruleId):q.Promise<any>
    {
        var self = this;
        return self.getDao().findExceptionByRuleId(options.startDate.getTime(), options.endDate.getTime(), ruleId);
    }
    getExceptionsbyExpertId(options, expertID):q.Promise<any>
    {
        var self = this;
        return self.getDao().findExceptionByExpertId(options.startDate.getTime(), options.endDate.getTime(), expertID);
    }
}
export = ExpertScheduleExceptionDelegate