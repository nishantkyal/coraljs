///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import log4js                                                   = require('log4js');
import User                                                     = require('../models/User');
import IntegrationMember                                        = require('../models/IntegrationMember');
import SMS                                                      = require('../models/SMS');
import UserPhone                                                = require('../models/UserPhone');
import PhoneCall                                                = require('../models/PhoneCall');
import VerificationCodeCache                                    = require('../caches/VerificationCodeCache');
import IntegrationMemberDelegate                                = require('../delegates/IntegrationMemberDelegate');
import EmailDelegate                                            = require('../delegates/EmailDelegate');
import SmsDelegate                                              = require('../delegates/SMSDelegate');
import UserDelegate                                             = require('../delegates/UserDelegate');
import UserPhoneDelegate                                        = require('../delegates/UserPhoneDelegate');
import NotificationDelegate                                     = require('../delegates/NotificationDelegate');
import Utils                                                    = require('../common/Utils');
import IncludeFlag                                              = require('../enums/IncludeFlag');
import SmsTemplate                                              = require('../enums/SmsTemplate');

class VerificationCodeDelegate
{
    private logger = log4js.getLogger(Utils.getClassName(this));

    private verificationCodeCache = new VerificationCodeCache();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private emailDelegate = new EmailDelegate();
    private smsDelegate = new SmsDelegate();
    private phoneNumberDelegate = new UserPhoneDelegate();
    private notificationDelegate = new NotificationDelegate();

    resendExpertInvitationCode(integrationId:number, member:IntegrationMember, sender?:User):q.Promise<any>
    {
        var self = this;

        return self.findVerificationCode(integrationId, member.getUser().getEmail())
            .then(
            function codeFound(invites:Object)
            {
                return q.all(_.map(_.keys(invites), function (code)
                {
                    var member = new IntegrationMember(invites[code]);
                    member.setUser(new User(member.getUser()));
                    return self.emailDelegate.sendExpertInvitationEmail(integrationId, code, member, sender)
                }));
            });
    }

    createAndSendExpertInvitationCode(integrationId:number, member:IntegrationMember, sender?:User):q.Promise<any>
    {
        var self = this;

        return self.deleteVerificationCode(integrationId, member.getUser().getEmail())
            .then(
            function oldCodeDeleted()
            {
                return self.verificationCodeCache.createInvitationCode(integrationId, member);
            })
            .then(
            function codeGenerated(code:string)
            {
                return self.emailDelegate.sendExpertInvitationEmail(member.getIntegrationId(), code, member, sender);
            });
    }

    checkExistingAndSendEmailVerificationCode(integrationId:number, member:IntegrationMember, sender?:User):q.Promise<any>
    {
        var self = this;

        return q.all([
            self.integrationMemberDelegate.findByEmail(member.getUser().getEmail(), integrationId),
            self.findVerificationCode(integrationId, member.getUser().getEmail())
        ]).
            then(
            function existingSearched(...args)
            {
                var expert = args[0][0];
                var invited = args[0][1];

                if (!Utils.isNullOrEmpty(expert))
                    throw('The expert is already registered');

                if (!Utils.isNullOrEmpty(invited))
                    throw('The expert is already registered');
            })
            .fail(
            function codeSendFailed(error)
            {
                // TODO: Mark as failed
                self.logger.debug('Error occurred while sending invitation to %s, error: %s', JSON.stringify(member.toJson()), error);
                throw(error);
            });
    }

    deleteVerificationCode(integrationId:number, email:string):q.Promise<any>
    {
        var self = this;

        return self.findVerificationCode(integrationId, email)
            .then(
            function codesFetched(invitedMembers:any[]):any
            {
                if (!Utils.isNullOrEmpty(invitedMembers))
                    return q.all(_.map(_.keys(invitedMembers), function (code:string)
                    {
                        return self.verificationCodeCache.deleteInvitationCode(code, integrationId);
                    }));
            });
    }

    findVerificationCode(integrationId:number, email:string):q.Promise<any>
    {
        var self = this;

        return self.verificationCodeCache.getInvitationCodes(integrationId)
            .then(
            function codesFetched(invites:any[])
            {
                var matchingInvites;
                for (var code in invites)
                {
                    var member = invites[code];
                    if (member.user.email == email) {
                        matchingInvites = matchingInvites || {};
                        matchingInvites[code] = member;
                    }
                }
                return matchingInvites;
            });
    }

    createAndSendMobileVerificationCode(phoneNumber:UserPhone):q.Promise<any>
    {
        var self = this;
        var code:string = Utils.getRandomInt(10001, 99999);

        return q.all([
            self.smsDelegate.sendVerificationSMS(phoneNumber.getCompleteNumber(), code),
            self.verificationCodeCache.createMobileVerificationCode(phoneNumber.getCompleteNumber(), code)
        ]);
    }

    verifyMobileCode(code:string, phoneNumber:UserPhone):q.Promise<UserPhone>
    {
        var self = this;

        return this.verificationCodeCache.searchMobileVerificationCode(code, phoneNumber.getCompleteNumber())
            .then(
            function verified(result)
            {
                if (result)
                    return self.phoneNumberDelegate.create(phoneNumber);
                else
                    throw ('Invalid code entered');
            });
    }

    createAppointmentAcceptCode(call:PhoneCall, startTimes:number[]):q.Promise<any>
    {
        var code:string = Utils.getRandomString(20);
        return this.verificationCodeCache.createAppointmentAcceptCode(call.getId(), code, startTimes);
    }

    verifyAppointmentAcceptCode(code:string):q.Promise<any>
    {
        return this.verificationCodeCache.searchAppointmentAcceptCode(code);
    }

    createAndSendEmailVerificationCode(user:User):q.Promise<any>
    {
        var self = this;
        var code = Utils.getRandomString(20);

        return this.verificationCodeCache.createEmailVerificationCode(user.getEmail(), code)
            .then(
            function codeCreated(code:string)
            {
                return self.notificationDelegate.sendAccountVerificationEmail(user, code);
            });
    }

    verifyAccountVerificationCode(email:string, code:string):q.Promise<boolean>
    {
        return this.verificationCodeCache.searchEmailVerificationCode(email, code);
    }

    deleteAccountVerificationCode(email:string):q.Promise<boolean>
    {
        return this.verificationCodeCache.deleteEmailVerificationCode(email);
    }


}
export = VerificationCodeDelegate