///<reference path='../_references.d.ts'/>
import nodeunit                                                 = require('nodeunit');
import _                                                        = require('underscore');
import EmailDelegate                                            = require('../delegates/EmailDelegate');
import IntegrationMember                                        = require('../models/IntegrationMember');
import ExpertSchedule                                           = require('../models/Schedule');
import User                                                     = require('../models/User');
import PhoneCall                                                = require('../models/PhoneCall');
import Formatter                                                = require('../common/Formatter');
import ApiUrlDelegate                                           = require('../delegates/ApiUrlDelegate');
import CallFlowUrls                                             = require('../routes/callFlow/Urls');
import DashboardUrls                                            = require('../routes/dashboard/Urls');

var SETUP_DELAY:number = 2000;

var emailDelegate = new EmailDelegate();
var initiated = false;

// View helpers
var helpers = {
    formatMoney: Formatter.formatMoney,
    formatRole: Formatter.formatRole,
    formatName: Formatter.formatName,
    formatSchedule: Formatter.formatSchedule,
    formatDate: Formatter.formatDate,
    formatUserStatus: Formatter.formatUserStatus,
    ApiUrlDelegate: ApiUrlDelegate,
    CallFlowUrls: CallFlowUrls,
    DashboardUrls: DashboardUrls
};

// Underscore template pattern
_.templateSettings = {
    evaluate: /\{\[([\s\S]+?)\]\}/g,
    interpolate: /\{\{([\s\S]+?)\}\}/g
};
_.mixin(helpers);

var email:string = 'nishant.kyal+snt-test@gmail.com';
var user = new User();
user.setEmail(email);
user.setFirstName('Nishant');
user.setLastName('Kyal');

function sendTestEmail()
{
    if (!initiated)
    {
        setTimeout(arguments.callee, SETUP_DELAY, [].slice.call(arguments, 0)[0]);
        initiated = true;
        return;
    }

    emailDelegate.sendTestEmail();
}
sendTestEmail();