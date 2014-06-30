///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import log4js                                                   = require('log4js');
import User                                                     = require('../models/User');
import IntegrationMember                                        = require('../models/IntegrationMember');
import UserPhone                                                = require('../models/UserPhone');
import PhoneCall                                                = require('../models/PhoneCall');
import IntegrationMemberDelegate                                = require('../delegates/IntegrationMemberDelegate');
import SMSDelegate                                              = require('../delegates/SMSDelegate');
import UserDelegate                                             = require('../delegates/UserDelegate');
import Utils                                                    = require('../common/Utils');
import IncludeFlag                                              = require('../enums/IncludeFlag');
import SmsTemplate                                              = require('../enums/SmsTemplate');
import CacheHelper                                              = require('../caches/CacheHelper');

class VerificationCodeDelegate
{
    private logger = log4js.getLogger(Utils.getClassName(this));

    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private emailDelegate;
    private smsDelegate = new SMSDelegate();
    private userDelegate = new UserDelegate();
    private notificationDelegate;

    constructor()
    {
        var EmailDelegate = require('../delegates/EmailDelegate');
        this.emailDelegate = new EmailDelegate();

        var NotificationDelegate = require('../delegates/NotificationDelegate');
        this.notificationDelegate = new NotificationDelegate();
    }

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
                var code = Utils.getRandomString(20, 'ABXDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');
                return [code, CacheHelper.addToHash('ic-' + integrationId, code, member)];
            })
            .spread(
            function codeGenerated(code:string, result)
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

                return self.createAndSendExpertInvitationCode(integrationId, member, sender);
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
                        return CacheHelper.delFromHash('ic-' + integrationId, code);
                    }));
            });
    }

    findVerificationCode(integrationId:number, email:string):q.Promise<any>
    {
        var self = this;

        return CacheHelper.getHash('ic-' + integrationId)
            .then(
            function codesFetched(invites:any[])
            {
                var matchingInvites;
                for (var code in invites)
                {
                    var member = invites[code];
                    if (member.user.email == email)
                    {
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

        var code:string = code || Utils.getRandomInt(1001, 9999);
        var secondsInAnHr:number = 60 * 60;

        return q.all([
            self.smsDelegate.sendVerificationSMS(phoneNumber.getCompleteNumber(), code),
            CacheHelper.set('mv-' + phoneNumber, code, secondsInAnHr, true)
        ])
            .then(
            function codeGeneratedAndSent(...args):any
            {
                return args;
            },
            function codeSendError(error)
            {
                throw (error);
            }
        );
    }

    verifyMobileCode(code:string, phoneNumber:UserPhone):q.Promise<any>
    {
        var self = this;

        return CacheHelper.get('mv-' + phoneNumber)
            .then(
            function tokenSearched(result)
            {
                if (result == code)
                    return q.resolve(true);
                else
                    throw ('Invalid code entered');
            });
        // TODO: Remove any scheduled tasks for reminding this guy to verify his mobile number
    }

    createAppointmentAcceptCode(call:PhoneCall, startTimes:number[], fromUserId:number):q.Promise<any>
    {
        var code:string = Utils.getRandomString(20);

        return CacheHelper.set('aa-' + code, {id: call.getId(), startTimes: startTimes, from: fromUserId})
            .then(
            function codeSaved() { return code; }
        );
    }

    verifyAppointmentAcceptCode(code:string):q.Promise<any>
    {
        return CacheHelper.get('aa-' + code);
    }

    deleteAppointmentAcceptCode(code:string):q.Promise<boolean>
    {
        return CacheHelper.del('aa-' + code);
    }

    createAndSendEmailVerificationCode(user:User):q.Promise<any>
    {
        var self = this;
        var code = Utils.getRandomString(20);
        var secondsInThreeDays:number = 60 * 60 * 24 * 3;

        return CacheHelper.set('ev-' + code, user, secondsInThreeDays)
            .then(
            function codeCreated()
            {
                return self.notificationDelegate.sendAccountVerificationEmail(user, code);
            });
    }

    verifyEmailVerificationCode(code:string, email:string):q.Promise<boolean>
    {
        return CacheHelper.get('ev-' + code)
            .then(
            function codeFetched(resukt:Object)
            {
                var user = new User(result);
                return user && user.getEmail() == email;
            });
    }

    deleteEmailVerificationCode(code:string):q.Promise<boolean>
    {
        return CacheHelper.del('ev-' + code);
    }

    createPasswordResetCode(email:string):q.Promise<any>
    {
        var code:string = Utils.getRandomString(10);
        var self = this;
        var secondsInAnHr:number = 60 * 60;

        return CacheHelper.set('pr-' + code, email, secondsInAnHr);
    }

    verifyCodeAndResetPassword(code:string, password:string):q.Promise<any>
    {
        var self = this;

        return CacheHelper.get('pr-' + code)
            .then(
            function codeFound(email:string)
            {
                return self.userDelegate.update({email: email}, {password: password});
            })
            .then(
            function passwordUpdated()
            {
                return CacheHelper.del('pr-' + code);
            });
    }

    searchInvitationCode(code:string, integrationId:number):q.Promise<any>
    {
        return CacheHelper.getFromHash('ic-' + integrationId, code)
            .then(
            function invitationCodeSearched(invitedUser)
            {
                if (Utils.isNullOrEmpty(invitedUser))
                    throw('Invalid invitation code');
                else
                    return invitedUser;
            }
        );
    }

    deleteInvitationCode(code:string, integrationId:number):q.Promise<any>
    {
        return CacheHelper.delFromHash('ic-' + integrationId, code);
    }

    getInvitationCodes(integrationId:number):q.Promise<any>
    {
        return CacheHelper.getHash('ic-' + integrationId);
    }

}
export = VerificationCodeDelegate