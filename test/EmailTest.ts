import EmailDelegate                                            = require('../delegates/EmailDelegate');
import IntegrationMember                                        = require('../models/IntegrationMember');
import ExpertSchedule                                           = require('../models/ExpertSchedule');
import User                                                     = require('../models/User');
import PhoneCall                                                = require('../models/PhoneCall');

export function sendExpertSchedulingEmail()
{
    var emailDelegate = new EmailDelegate();


    var expert = new IntegrationMember();
    var user = new User();
    var call= new PhoneCall();
    var schedules:number[] = [];
    var duration:number;

    emailDelegate.sendSchedulingEmailToExpert(expert, schedules, duration, user, call)
};