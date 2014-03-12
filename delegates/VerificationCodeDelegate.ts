///<reference path='../_references.d.ts'/>
import _                                                        = require('underscore');
import q                                                        = require('q');
import log4js                                                   = require('log4js');
import TemporaryTokenType                                       = require('../enums/TemporaryTokenType');
import User                                                     = require('../models/User');
import IntegrationMember                                        = require('../models/IntegrationMember');
import VerificationCodeCache                                    = require('../caches/VerificationCodeCache');
import IntegrationMemberDelegate                                = require('../delegates/IntegrationMemberDelegate');
import EmailDelegate                                            = require('../delegates/EmailDelegate');
import UserDelegate                                             = require('../delegates/UserDelegate');
import Utils                                                    = require('../common/Utils');
import IncludeFlag                                              = require('../enums/IncludeFlag');

class VerificationCodeDelegate
{
    private logger = log4js.getLogger(Utils.getClassName(this));

    private verificationCodeCache = new VerificationCodeCache();
    private userDelegate = new UserDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private emailDelegate = new EmailDelegate();

    createAndSendExpertInvitationCode(integrationId:number, member:IntegrationMember, sender?:User):q.Promise<any>
    {
        var self = this;

        return self.integrationMemberDelegate.findByEmail(member.getUser().getEmail())
            .then(
            function expertFound(expert)
            {
                if (!expert.isValid())
                    return this.verificationCodeCache.getInvitationCodes(integrationId);
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
                self.logger.debug('Error occurred while sending invitation to %s, error: %s', JSON.stringify(member.toJson()), error);
                throw (error);
            });
    }
}
export = VerificationCodeDelegate