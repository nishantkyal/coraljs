///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import log4js                                                   = require('log4js');
import User                                                     = require('../models/User');
import IntegrationMember                                        = require('../models/IntegrationMember');
import SMS                                                      = require('../models/SMS');
import PhoneNumber                                              = require('../models/PhoneNumber');
import VerificationCodeCache                                    = require('../caches/VerificationCodeCache');
import IntegrationMemberDelegate                                = require('../delegates/IntegrationMemberDelegate');
import EmailDelegate                                            = require('../delegates/EmailDelegate');
import SmsDelegate                                              = require('../delegates/SMSDelegate');
import UserDelegate                                             = require('../delegates/UserDelegate');
import PhoneNumberDelegate                                      = require('../delegates/PhoneNumberDelegate');
import Utils                                                    = require('../common/Utils');
import IncludeFlag                                              = require('../enums/IncludeFlag');
import SmsTemplate                                              = require('../enums/SmsTemplate');

class VerificationCodeDelegate
{
    private logger = log4js.getLogger(Utils.getClassName(this));

    private verificationCodeCache = new VerificationCodeCache();
    private userDelegate = new UserDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private emailDelegate = new EmailDelegate();
    private smsDelegate = new SmsDelegate();
    private phoneNumberDelegate = new PhoneNumberDelegate();

    createAndSendExpertInvitationCode(integrationId:number, member:IntegrationMember, sender?:User):q.Promise<any>
    {
        var self = this;

        return self.integrationMemberDelegate.findByEmail(member.getUser().getEmail(), integrationId)
            .then(
            function expertFound(expert)
            {
                if (!expert.isValid())
                    return self.verificationCodeCache.getInvitationCodes(integrationId);
                else
                    throw('The expert is already registered');
            })
            .then(
            function invitationCodesFetched(invitedMembers:any[])
            {
                // Check if an invitation has already been sent to the email
                var matchingMember = _.find(invitedMembers, function (m:any):boolean
                {
                    return m.user.email == member.getUser().getEmail();
                });

                if (Utils.isNullOrEmpty(matchingMember))
                    return self.verificationCodeCache.createInvitationCode(integrationId, member);
                else
                    throw('The user has already been sent an invitation');
            })
            .then(
            function codeGenerated(code:string)
            {
                return self.emailDelegate.sendExpertInvitationEmail(member.getIntegrationId(), code, member, sender);
            })
            .fail(
            function codeSendFailed(error)
            {
                // TODO: Mark as failed
                self.logger.debug('Error occurred while sending invitation to %s, error: %s', JSON.stringify(member.toJson()), error);
            }
        );
    }

    createAndSendMobileVerificationCode(phoneNumber:PhoneNumber):q.Promise<any>
    {
        var self = this;
        var code = Utils.getRandomInt(10001, 99999);
        var smsMessage = this.smsDelegate.generateSMSText(SmsTemplate.VERIFY_NUMBER, {code: code});

        var sms = new SMS();
        sms.setPhone(phoneNumber);
        sms.setMessage(smsMessage);

        return q.all([
            self.smsDelegate.send(sms),
            self.verificationCodeCache.createMobileVerificationCode(phoneNumber.getCompleteNumber())
        ]);
    }

    verifyMobileCode(code:string, phoneNumber:PhoneNumber):q.Promise<PhoneNumber>
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
}
export = VerificationCodeDelegate