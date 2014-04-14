///<reference path='../_references.d.ts'/>
import nodeunit                                                 = require('nodeunit');
import _                                                        = require('underscore');
import EmailDelegate                                            = require('../delegates/EmailDelegate');
import VerificationCodeDelegate                                 = require('../delegates/VerificationCodeDelegate');
import IntegrationMember                                        = require('../models/IntegrationMember');
import ExpertSchedule                                           = require('../models/ExpertSchedule');
import User                                                     = require('../models/User');
import PhoneCall                                                = require('../models/PhoneCall');
import Formatter                                                = require('../common/Formatter');
import ApiUrlDelegate                                           = require('../delegates/ApiUrlDelegate');
import CallFlowUrls                                             = require('../routes/callFlow/Urls');
import DashboardUrls                                            = require('../routes/dashboard/Urls');

var SETUP_DELAY:number = 2000;

var emailDelegate = new EmailDelegate();
var verificationCodeDelegate = new VerificationCodeDelegate();
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

export function sendExpertSchedulingEmail(test:nodeunit.Test)
{
    if (!initiated)
    {
        setInterval(arguments.callee, SETUP_DELAY, [].slice.call(arguments, 0)[0]);
        initiated = true;
        return;
    }

    var user = new User();
    var call = new PhoneCall();
    var schedules:number[] = [];
    var duration:number = 15;

    test.done();
    //emailDelegate.sendSchedulingEmailToExpert(call, schedules, duration, user)
};

export function sendAccountVerificationEmail(test:nodeunit.Test)
{
    if (!initiated)
    {
        setInterval(arguments.callee, SETUP_DELAY, [].slice.call(arguments, 0)[0]);
        initiated = true;
        return;
    }

    verificationCodeDelegate.createEmailVerificationCode(email)
        .then(
        function codeCreated(code:string)
        {
            return emailDelegate.sendAccountVerificationEmail(user, code);
        })
        .finally(
        function emailSent()
        {
            test.done();
        });
}