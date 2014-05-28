///<reference path='../../_references.d.ts'/>
import q                                                = require('q');
import _                                                = require('underscore');
import passport                                         = require('passport');
import connect_ensure_login                             = require('connect-ensure-login');
import express                                          = require('express');
import log4js                                           = require('log4js');
import accounting                                       = require('accounting');
import AuthenticationDelegate                           = require('../../delegates/AuthenticationDelegate');
import UserDelegate                                     = require('../../delegates/UserDelegate');
import IntegrationDelegate                              = require('../../delegates/IntegrationDelegate');
import IntegrationMemberDelegate                        = require('../../delegates/IntegrationMemberDelegate');
import EmailDelegate                                    = require('../../delegates/EmailDelegate');
import SMSDelegate                                      = require('../../delegates/SMSDelegate');
import CouponDelegate                                   = require('../../delegates/CouponDelegate');
import UserPhoneDelegate                                = require('../../delegates/UserPhoneDelegate');
import PhoneCallDelegate                                = require('../../delegates/PhoneCallDelegate');
import NotificationDelegate                             = require('../../delegates/NotificationDelegate');
import UserEducationDelegate                            = require('../../delegates/UserEducationDelegate');
import UserSkillDelegate                                = require('../../delegates/UserSkillDelegate');
import UserEmploymentDelegate                           = require('../../delegates/UserEmploymentDelegate');
import RefSkillCodeDelegate                             = require('../../delegates/SkillCodeDelegate');
import UserProfileDelegate                              = require('../../delegates/UserProfileDelegate');
import VerificationCodeDelegate                         = require('../../delegates/VerificationCodeDelegate');
import MysqlDelegate                                    = require('../../delegates/MysqlDelegate');
import UserUrlDelegate                                  = require('../../delegates/UserUrlDelegate');
import TransactionDelegate                              = require('../../delegates/TransactionDelegate');
import TransactionLineDelegate                          = require('../../delegates/TransactionLineDelegate');
import MoneyUnit                                        = require('../../enums/MoneyUnit');
import IncludeFlag                                      = require('../../enums/IncludeFlag');
import TransactionType                                  = require('../../enums/TransactionType');
import ItemType                                         = require('../../enums/ItemType');
import User                                             = require('../../models/User');
import IntegrationMember                                = require('../../models/IntegrationMember');
import Integration                                      = require('../../models/Integration');
import SMS                                              = require('../../models/SMS');
import Coupon                                           = require('../../models/Coupon');
import UserPhone                                        = require('../../models/UserPhone');
import PhoneCall                                        = require('../../models/PhoneCall');
import UserProfile                                      = require('../../models/UserProfile');
import Transaction                                      = require('../../models/Transaction');
import TransactionLine                                  = require('../../models/TransactionLine');
import IntegrationMemberRole                            = require('../../enums/IntegrationMemberRole');
import ApiConstants                                     = require('../../enums/ApiConstants');
import SmsTemplate                                      = require('../../enums/SmsTemplate');
import CallStatus                                       = require('../../enums/CallStatus');
import IndustryCodes                                    = require('../../enums/IndustryCode');
import ProfileStatus                                    = require('../../enums/ProfileStatus');
import Utils                                            = require('../../common/Utils');
import Formatter                                        = require('../../common/Formatter');
import Config                                           = require('../../common/Config');
import PayZippyProvider                                 = require('../../providers/PayZippyProvider');
import CallFlowSessionData                              = require('../../routes/callFlow/SessionData');
import ExpertRegistrationSessionData                    = require('../../routes/expertRegistration/SessionData');

import Middleware                                       = require('./Middleware');
import Urls                                             = require('./Urls');
import SessionData                                      = require('./SessionData');

class DashboardRoute
{
    private static PAGE_LOGIN:string = 'dashboard/login';
    private static PAGE_FORGOT_PASSWORD:string = 'dashboard/forgotPassword';
    private static PAGE_MOBILE_VERIFICATION:string = 'dashboard/mobileVerification';
    private static PAGE_INTEGRATIONS:string = 'dashboard/integrations';
    private static PAGE_USERS:string = 'dashboard/integrationUsers';
    private static PAGE_COUPONS:string = 'dashboard/integrationCoupons';
    private static PAGE_PROFILE:string = 'dashboard/memberProfile';
    private static PAGE_ACCOUNT_VERIFICATION:string = 'dashboard/accountVerification';
    private static PAGE_PAYMENT_COMPLETE:string = 'dashboard/paymentComplete';
    private static PAGE_CALL_DETAILS:string = 'dashboard/callDetails'

    private integrationDelegate = new IntegrationDelegate();
    private integrationMemberDelegate = new IntegrationMemberDelegate();
    private userDelegate = new UserDelegate();
    private verificationCodeDelegate = new VerificationCodeDelegate();
    private couponDelegate = new CouponDelegate();
    private userEmploymentDelegate = new UserEmploymentDelegate();
    private userSkillDelegate = new UserSkillDelegate();
    private userEducationDelegate = new UserEducationDelegate();
    private userPhoneDelegate = new UserPhoneDelegate();
    private phoneCallDelegate = new PhoneCallDelegate();
    private notificationDelegate = new NotificationDelegate();
    private userProfileDelegate = new UserProfileDelegate();
    private userUrlDelegate = new UserUrlDelegate();
    private transactionLineDelegate = new TransactionLineDelegate();
    private transactionDelegate = new TransactionDelegate();

    constructor(app, secureApp)
    {
        // Pages
        app.get(Urls.index(), connect_ensure_login.ensureLoggedIn(), this.authSuccess.bind(this));
        app.get(Urls.login(), this.login.bind(this));
        app.get(Urls.forgotPassword(), this.forgotPassword.bind(this));
        app.get(Urls.mobileVerification(), connect_ensure_login.ensureLoggedIn({failureRedirect: Urls.index(), setReturnTo: true}), this.verifyMobile.bind(this));
        app.get(Urls.integrations(), connect_ensure_login.ensureLoggedIn(), this.integrations.bind(this));
        app.get(Urls.integrationCoupons(), Middleware.allowOwnerOrAdmin, this.coupons.bind(this));
        app.get(Urls.integrationMembers(), Middleware.allowOwnerOrAdmin, this.integrationUsers.bind(this));
        app.get(Urls.memberProfile(), this.editMemberProfile.bind(this));
        app.get(Urls.callDetails(), Middleware.allowMeOrAdmin, this.callDetails.bind(this));
        app.get(Urls.revenueDetails(), Middleware.allowMeOrAdmin, this.revenueDetails.bind(this));

        app.get(Urls.logout(), this.logout.bind(this));
        app.post(Urls.paymentCallback(), this.paymentComplete.bind(this));
        app.get(Urls.paymentCallback(), this.paymentComplete.bind(this));
        app.get(Urls.emailAccountVerification(), this.emailAccountVerification.bind(this));

        // Fetch profile details from linkedin
        app.get(Urls.userProfileFromLinkedIn(), this.putLinkedInFieldsInSession.bind(this), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: Urls.index(),
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.userProfileFromLinkedInCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN_FETCH, {failureRedirect: Urls.index(),
            failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}), this.linkedInCallBack.bind(this));

        // Auth
        app.post(Urls.login(), passport.authenticate(AuthenticationDelegate.STRATEGY_LOGIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
        app.post(Urls.register(), AuthenticationDelegate.register(), this.authSuccess.bind(this));
        app.post(Urls.memberProfile(), Middleware.allowMeOrAdmin, this.memberProfileSave.bind(this));
        app.post(Urls.changePassword(), Middleware.allowMeOrAdmin, this.changePassword.bind(this));
        app.post(Urls.changeProfileStatus(), Middleware.allowMeOrAdmin, this.changeProfileStatus.bind(this));
        app.post(Urls.publishProfile(), Middleware.allowOwnerOrAdmin, this.publishProfile.bind(this));

        app.get(Urls.linkedInLogin(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true, scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile']}));
        app.get(Urls.linkedInLoginCallback(), passport.authenticate(AuthenticationDelegate.STRATEGY_LINKEDIN, {failureRedirect: Urls.login(), failureFlash: true}), this.authSuccess.bind(this));
    }

    /* Login page */
    private login(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var isLoggedIn = !Utils.isNullOrEmpty(sessionData.getLoggedInUser());
        if (isLoggedIn)
        {
            res.redirect(Urls.index());
            return;
        }

        var pageData = _.extend(sessionData.getData(), {
            messages: req.flash()
        });
        res.render(DashboardRoute.PAGE_LOGIN, pageData);
    }

    /* Forgot Password page */
    private forgotPassword(req:express.Request, res:express.Response)
    {
        var code:string = req.query[ApiConstants.CODE];

        var pageData = {
            code: code,
            messages: req.flash()
        };

        res.render(DashboardRoute.PAGE_FORGOT_PASSWORD, pageData);
    }

    private changePassword(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var password:string = req.body[ApiConstants.PASSWORD];
        var oldPassword:string = req.body[ApiConstants.OLD_PASSWORD];
        var user = sessionData.getLoggedInUser();

        var hashedPassword:string = self.userDelegate.computePasswordHash(user.getEmail(), oldPassword);
        if (hashedPassword != user.getPassword())
            res.send('Error in changing password. Old Password did not match').status(412);
        else
            self.userDelegate.update({id: sessionData.getLoggedInUser().getId()}, {password: password})
                .then(
                function passwordUpdated() { res.send('Password Changed Successfully').status(200); },
                function PasswordUpdateError(error) { res.send('Password Change Failed. Internal Server Error').status(500); }
            )
    }

    /**
     * Mobile Verification page
     * The page has a contextual header so it can be used in multiple places
     */
    private verifyMobile(req:express.Request, res:express.Response)
    {
        this.userPhoneDelegate.find(Utils.createSimpleObject(UserPhone.USER_ID, req[ApiConstants.USER].id))
            .then(
            function phoneNumbersFetched(numbers:UserPhone[]) { return numbers; },
            function phoneNumberFetchError(error) { return null; })
            .then(
            function renderPage(numbers)
            {
                var sessionData:any;
                var context = req.query[ApiConstants.CONTEXT] || 'Dashboard';

                switch (context)
                {
                    case 'expertRegistration':
                        sessionData = new ExpertRegistrationSessionData(req);
                        break;
                    case 'callFlow':
                        sessionData = new CallFlowSessionData(req);
                        break;
                    default:
                        sessionData = new SessionData(req);
                        break;
                }

                var pageData = _.extend(sessionData.getData(), {
                    userPhones: numbers,
                    context: context,
                    messages: req.flash()
                });
                res.render(DashboardRoute.PAGE_MOBILE_VERIFICATION, pageData);
            });
    }

    /**
     * Authentication Success page
     * Renders integrations page by default after fetching all network member entries for the user
     * Returns to returnTo, if set in session
     */
    private authSuccess(req, res:express.Response)
    {
        var sessionData = new SessionData(req);

        if (req.get('content-type') && req.get('content-type').indexOf('application/json') != -1)
        {
            res.send(200, {status: 'OK'});
            return null;
        }

        // Return if specified
        if (req.session[ApiConstants.RETURN_TO])
        {
            var returnToUrl = req.session[ApiConstants.RETURN_TO];
            req.session[ApiConstants.RETURN_TO] = null;
            res.redirect(returnToUrl);
            return;
        }

        // 1. Fetch member entries for user
        // 2. If multiple entries, show integrations list
        // 3. If single entry and I'm owner, show members page
        // 4. Else redirect to memberProfile
        this.integrationMemberDelegate.search({user_id: sessionData.getLoggedInUser().getId()}, null, [IncludeFlag.INCLUDE_INTEGRATION, IncludeFlag.INCLUDE_USER])
            .then(
            function integrationsFetched(integrationMembers)
            {
                if (Utils.isNullOrEmpty(integrationMembers))
                {
                    req.logout();
                    res.send(401, 'Seems like you don\'t have an account yet.');
                }
                else
                {
                    // TODO: Clean up data because we haven't implemented foreign keys correctly
                    var correctedMembers = _.map(integrationMembers, function (member:IntegrationMember)
                    {
                        var users:User[] = member[IntegrationMember.USER];
                        var integrations:Integration[] = member[IntegrationMember.INTEGRATION];
                        member.setUser(_.findWhere(users, {'id': member.getUserId()}));
                        member.setIntegration(_.findWhere(integrations, {'id': member.getIntegrationId()}));
                        return member;
                    });

                    sessionData.setMembers(correctedMembers);
                    res.redirect(Urls.integrations());
                }
            },
            function integrationsFetchError(error)
            {
                res.send(500);
            }
        );
    }

    /* Integrations List page */
    private integrations(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        sessionData.setIntegration(null);
        var pageData = sessionData.getData();
        res.render(DashboardRoute.PAGE_INTEGRATIONS, pageData);
    }

    /* Integration Members page */
    private integrationUsers(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var self = this;

        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integration = this.integrationDelegate.getSync(integrationId);
        sessionData.setIntegration(integration);

        // 1. Fetch all users for integration
        // 2. Fetch all invited members for integration
        // 3. Merge the two lists
        q.all([
            self.integrationMemberDelegate.search({integration_id: integrationId}, IntegrationMember.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_USER]),
            self.verificationCodeDelegate.getInvitationCodes(integrationId)
        ])
            .then(
            function membersFetched(...results)
            {
                var members = results[0][0];
                var invitedMembers = [].concat(_.values(results[0][1]));

                _.each(members, function (member:IntegrationMember)
                {
                    if (Utils.getObjectType(member[IntegrationMember.USER]) == 'Array')
                    // TODO: Implement foreign keys to get rid if this goofiness
                        member[IntegrationMember.USER] = _.findWhere(member[IntegrationMember.USER], {id: member.getUserId()});
                });

                // Mark members who have an expert entry as well as an invited entry as inactive
                // since this means they haven't completed the registration process
                _.each(invitedMembers, function (invitedMember)
                {
                    var expertEntry = _.find(members, function (member:IntegrationMember)
                    {
                        return invitedMember['user']['email'] == member.getUser().getEmail();
                    });

                    if (!Utils.isNullOrEmpty(expertEntry))
                        invitedMember.user['status'] = 'Registered';
                });

                members = members.concat(_.map(invitedMembers, function (invited) { return new IntegrationMember(invited); }));

                var pageData = _.extend(sessionData.getData(), {
                    'members': members
                });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render(DashboardRoute.PAGE_USERS, pageData);
            },
            function usersFetchError(error) { res.send(500, error); });
    }

    /* Integration Coupons page */
    private coupons(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);

        var integrationId = parseInt(req.params[ApiConstants.INTEGRATION_ID]);
        var integration = this.integrationDelegate.getSync(integrationId);
        sessionData.setIntegration(integration);

        this.couponDelegate.search({integration_id: integrationId}, Coupon.DASHBOARD_FIELDS, [IncludeFlag.INCLUDE_EXPERT])
            .then(
            function couponsFetched(coupons:Coupon[])
            {
                var pageData = _.extend(sessionData.getData(), {
                    'coupons': coupons
                });

                res.render(DashboardRoute.PAGE_COUPONS, pageData);
            },
            function couponFetchError(error) { res.send(500); }
        )
    }

    /* Member Profile page */
    private editMemberProfile(req:express.Request, res:express.Response)
    {
        var self = this;
        var memberId = parseInt(req.params[ApiConstants.MEMBER_ID]);
        var mode = req.query[ApiConstants.MODE]
        var sessionData = new SessionData(req);
        var userProfile:UserProfile = new UserProfile();
        var member:IntegrationMember;
        var loggedInUser = sessionData.getLoggedInUser();

        q.all([
            self.integrationMemberDelegate.get(memberId, IntegrationMember.DASHBOARD_FIELDS),
            self.userProfileDelegate.find({'integration_member_id': memberId})
        ])
            .then(
            function memberFetched(...args)
            {
                member = args[0][0];
                var userId:number = member.getUserId();

                userProfile = args[0][1] || userProfile;
                var profileInfoTasks = [self.userDelegate.get(userId)];

                if (!Utils.isNullOrEmpty(userProfile) && userProfile.getId())
                    profileInfoTasks = profileInfoTasks.concat([
                        self.userSkillDelegate.getSkillWithName(userProfile.getId()),
                        self.userEducationDelegate.search({'profileId': userProfile.getId()}),
                        self.userEmploymentDelegate.search({'profileId': userProfile.getId()}),
                        self.userUrlDelegate.search({'profileId': userProfile.getId()}),
                        Middleware.isSelf(loggedInUser, memberId),
                        Middleware.isAdminOrOwner(loggedInUser, memberId)
                    ]);

                if(loggedInUser)
                    profileInfoTasks = profileInfoTasks.concat([
                        self.integrationMemberDelegate.find({integration_id:member.getIntegrationId(),user_id:loggedInUser.getId()})
                    ]);

                return q.all(profileInfoTasks);
            })
            .then(
            function memberDetailsFetched(...args)
            {
                var user = args[0][0];
                var userSkill = args[0][1] || [];
                var userEducation = args[0][2] || [];
                var userEmployment = args[0][3] || [];
                var userUrl = args[0][4] || [];
                var isEditable = args[0][5] || args[0][6] || false;
                var tempMember = args[0][7];
                var adminOrOwner;

                if(tempMember && (tempMember.getRole() == IntegrationMemberRole.Owner || tempMember.getRole() == IntegrationMemberRole.Admin ))
                    adminOrOwner = tempMember;

                if(mode == ApiConstants.PUBLIC_MODE)
                    isEditable = false;
                
                var profileId = userProfile ? userProfile.getId() : null;

                var pageData = _.extend(sessionData.getData(), {
                    'profileId': profileId,
                    'member': member,
                    'adminOrOwner': adminOrOwner,
                    'user': user,
                    'userSkill': _.sortBy(userSkill, function (skill) { return skill['skill_name'].length; }),
                    'userProfile': userProfile,
                    'userEducation': userEducation,
                    'userEmployment': userEmployment,
                    'userUrl': userUrl,
                    'messages': req.flash(),
                    'isEditable': isEditable
                });
                res.render(DashboardRoute.PAGE_PROFILE, pageData);
            },
            function memberDetailsFetchError(error)
            {
                res.render('500', {error: error});
            });
    }

    private memberProfileSave(req:express.Request, res:express.Response)
    {
        var sessionData = new SessionData(req);
        var user = req.body[ApiConstants.USER];
        var userProfile = req.body[ApiConstants.USER_PROFILE];

        q.all([
            this.userDelegate.update({id: sessionData.getLoggedInUser().getId()}, user),
            this.userProfileDelegate.update({id: userProfile.id}, userProfile)
        ])
            .then(
            function userUpdated() { res.send(200); },
            function userUpdateError(error) { res.send(500); }
        );
    }

    changeProfileStatus(req:express.Request, res:express.Response)
    {
        var self = this;

        var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);
        var userProfile:UserProfile = new UserProfile();
        var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);

        userProfile.setStatus(ProfileStatus.PENDING_APPROVAL);
        this.userProfileDelegate.update({id: profileId}, userProfile)
            .then(
            function userUpdated()
            {
                self.notificationDelegate.sendProfilePendingApprovalNotification(memberId)
                    .then(
                    function emailSent() { res.send(200); }
                )
            }
        )
            .fail(function userUpdateError(error) { res.send(500); })
    }

    publishProfile(req:express.Request, res:express.Response, transaction?:Object)
    {
        var profileId:number = parseInt(req.body[ApiConstants.USER_PROFILE_ID]);
        var userId:number = parseInt(req.body[ApiConstants.USER_ID]);
        var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);

        q.all([
            this.userProfileDelegate.publishProfile(profileId, userId),
            this.notificationDelegate.sendProfileApprovedNotification(memberId)
        ])
            .then(
            function profilePublished() { res.send(200); },
            function profilePublishError(error) { res.send(500); }
        )
    }

    callDetails(req:express.Request, res:express.Response)
    {
        var self = this;
        var memberId:number = parseInt(req.params[ApiConstants.MEMBER_ID]);
        var sessionData = new SessionData(req);

        self.phoneCallDelegate.search({'integration_member_id':memberId})
        .then(
        function callDetailsFetched(calls){
            var pageData = _.extend(sessionData.getData(), {
                calls:calls || []
            });
            res.render(DashboardRoute.PAGE_CALL_DETAILS, pageData);
        })
        .fail( function CallDetailsFetchError(error){ res.send(500); })
    }

    revenueDetails(req:express.Request, res:express.Response)
    {
        res.send(200);
    }

    /* Logout and redirect to login page */
    private logout(req, res)
    {
        req.logout();
        res.redirect(Urls.index());
    }

    /* Handle payment response from gateway */
    private paymentComplete(req:express.Request, res:express.Response)
    {
        var self = this;
        var sessionData = new SessionData(req);
        var callFlowSessionData = new CallFlowSessionData(req);
        var payZippyProvider = new PayZippyProvider();

        // 1. Fetch transaction lines for the successful transaction
        // 2. Update transaction status
        // 3. Take next actions based on products in the transaction
        payZippyProvider.handleResponse(req)
            .then(
            function responseProcessed(transactionId:number)
            {
                if(transactionId == null)
                    transactionId = callFlowSessionData.getTransaction().getId();
                return self.transactionLineDelegate.search(Utils.createSimpleObject(TransactionLine.TRANSACTION_ID, transactionId))
            })
            .then(
            function transactionLinesFetched(lines:TransactionLine[])
            {
                // Assumption: We only have one call on the transaction
                var callId = _.findWhere(lines, {item_type: ItemType.PHONE_CALL}).getItemId();
                return [lines, self.phoneCallDelegate.get(callId, null, [IncludeFlag.INCLUDE_INTEGRATION_MEMBER])];
            })
            .spread(
            function callFetched(lines:TransactionLine[], call:PhoneCall)
            {
                lines = _.sortBy(lines, function(line:TransactionLine) {
                    return line.getTransactionType();
                });

                // 1. Update call status
                // 2. Send notifications
                return q.all([
                    self.phoneCallDelegate.update(call.getId(), {status: CallStatus.SCHEDULING}),
                    self.notificationDelegate.sendCallSchedulingNotifications(call.getId(), callFlowSessionData.getAppointments(), call.getDuration(), sessionData.getLoggedInUser())
                ])
                    .then(
                    function renderPage()
                    {
                        var pageData = _.extend(callFlowSessionData.getData(), {
                            transactionLines: lines,
                            call: call
                        });
                        callFlowSessionData.setTransaction(null);
                        callFlowSessionData.setCall(null);
                        callFlowSessionData.setAppointments([]);
                        
                        delete req.session[CallFlowSessionData.IDENTIFIER]
                        res.render(DashboardRoute.PAGE_PAYMENT_COMPLETE, pageData);
                    });
            })
            .fail(
            function handleError(error)
            {
                var pageData = _.extend(callFlowSessionData.getData(), {
                    error: error
                });
                res.render(DashboardRoute.PAGE_PAYMENT_COMPLETE, pageData);
            });
    }

    private emailAccountVerification(req, res:express.Response)
    {
        var self = this;
        var code:string = req.query[ApiConstants.CODE];
        var email:string = req.query[ApiConstants.EMAIL];

        if (Utils.isNullOrEmpty(code) || Utils.isNullOrEmpty(email))
        {
            res.send(400, 'Invalid code or email');
            return;
        }

        this.verificationCodeDelegate.verifyEmailVerificationCode(email, code)
            .then(
            function verified(result):any
            {
                if (result)
                {
                    req.logout();
                    res.render(DashboardRoute.PAGE_ACCOUNT_VERIFICATION);
                    return email;
                }
                else
                    res.send(500, 'Account verification failed. Invalid code or email');
            },
            function verificationFailed(error) { res.send(500); })
            .then(
            function responseSent()
            {
                return self.userDelegate.recalculateStatus({email: email});
            })
            .then(
            function statusUpdated()
            {
                return self.verificationCodeDelegate.deleteEmailVerificationCode(email);
            });
    }

    private linkedInCallBack(req:express.Request, res:express.Response)
    {
        var self = this;

        var fetchFields = req.session[ApiConstants.LINKEDIN_FETCH_FIELDS];
        var profileId:number = req.session[ApiConstants.USER_PROFILE_ID];
        var memberId:number = req.session[ApiConstants.MEMBER_ID];

        self.userProfileDelegate.get(profileId)
            .then(
            function profileFetched(userProfile:UserProfile)
            {
                return self.integrationMemberDelegate.get(userProfile.getIntegrationMemberId())
            })
            .then(
            function (integrationMember:IntegrationMember)
            {
                var fetchTasks = [];
                var integration_id:number = integrationMember.getIntegrationId();
                var userId:number = integrationMember.getUserId();

                if (fetchFields[ApiConstants.FETCH_PROFILE_PICTURE])
                    fetchTasks.push(self.userProfileDelegate.fetchProfilePictureFromLinkedIn(userId, integration_id, profileId));

                if (fetchFields[ApiConstants.FETCH_BASIC])
                    fetchTasks.push(self.userProfileDelegate.fetchBasicDetailsFromLinkedIn(userId, integration_id, profileId));

                if (fetchFields[ApiConstants.FETCH_EDUCATION])
                    fetchTasks.push(self.userProfileDelegate.fetchAndReplaceEducation(userId, integration_id, profileId));

                if (fetchFields[ApiConstants.FETCH_EMPLOYMENT])
                    fetchTasks.push(self.userProfileDelegate.fetchAndReplaceEmployment(userId, integration_id, profileId));

                if (fetchFields[ApiConstants.FETCH_SKILL])
                    fetchTasks.push(self.userProfileDelegate.fetchAndReplaceSkill(userId, integration_id, profileId));

                return q.all(fetchTasks);
            })
            .then(
            function profileFetched(...args)
            {
                res.redirect(Urls.memberProfile(memberId));
            },
            function fetchError(error)
            {
                res.send(500);
            }
        );
    }

    private putLinkedInFieldsInSession(req:express.Request, res:express.Response, next:Function)
    {
        var profileId:number = parseInt(req.params[ApiConstants.USER_PROFILE_ID]);
        var fetchBasic:boolean = req.query[ApiConstants.FETCH_BASIC] == 'on' ? true : false;
        var fetchEducation:boolean = req.query[ApiConstants.FETCH_EDUCATION] == 'on' ? true : false;
        var fetchEmployment:boolean = req.query[ApiConstants.FETCH_EMPLOYMENT] == 'on' ? true : false;
        var fetchProfilePicture:boolean = req.query[ApiConstants.FETCH_PROFILE_PICTURE] == 'on' ? true : false;
        var fetchSkill:boolean = req.query[ApiConstants.FETCH_SKILL] == 'on' ? true : false;
        req.session[ApiConstants.LINKEDIN_FETCH_FIELDS] = {fetchBasic: fetchBasic, fetchEducation: fetchEducation, fetchEmployment: fetchEmployment, fetchProfilePicture: fetchProfilePicture, fetchSkill: fetchSkill};
        req.session[ApiConstants.USER_PROFILE_ID] = profileId;
        req.session[ApiConstants.MEMBER_ID] = parseInt(req.query[ApiConstants.MEMBER_ID]);
        next();
    }
}

export = DashboardRoute