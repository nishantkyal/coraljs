///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import passport                                 = require('passport');
import passport_linkedin                        = require('passport-linkedin');
import q                                        = require('q');
import OAuth                                    = require('oauth');
import BaseDaoDelegate                          = require('./BaseDaoDelegate');
import UserEmploymentDelegate                   = require('../delegates/UserEmploymentDelegate');
import UserEducationDelegate                    = require('../delegates/UserEducationDelegate');
import UserSkillDelegate                        = require('../delegates/UserSkillDelegate');
import UserUrlDelegate                          = require('../delegates/UserUrlDelegate');
import SkillCodeDelegate                        = require('../delegates/SkillCodeDelegate');
import UserOAuthDelegate                        = require('../delegates/UserOAuthDelegate');
import ImageDelegate                            = require('../delegates/ImageDelegate');
import IntegrationMemberDelegate                = require('../delegates/IntegrationMemberDelegate');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import UserProfileDao                           = require('../dao/UserProfileDao');
import UserProfile                              = require('../models/UserProfile');
import UserSkill                                = require('../models/UserSkill');
import UserEmployment                           = require('../models/UserEmployment');
import UserEducation                            = require('../models/UserEducation');
import UserUrl                                  = require('../models/UserUrl');
import SkillCode                                = require('../models/SkillCode');
import User                                     = require('../models/User');
import UserOauth                                = require('../models/UserOauth');
import IntegrationMember                        = require('../models/IntegrationMember');
import Config                                   = require('../common/Config');
import Utils                                    = require('../common/Utils');
import IndustryCodes                            = require('../enums/IndustryCode');
import IncludeFlag                              = require('../enums/IncludeFlag');
import ProfileStatus                            = require('../enums/ProfileStatus');

class UserProfileDelegate extends BaseDaoDelegate
{
    static BASIC_FIELDS:string[] = ['id', 'first-name', 'last-name', 'email-address', 'headline', 'industry', 'summary', 'date-of-birth'];
    static EDUCATION_FIELDS:string[] = ['educations'];
    static POSITION_FIELDS:string[] = ['positions'];
    static SKILL_FIELDS:string[] = ['skills'];
    static IMAGE_FIELDS:string[] = ['picture-urls::(original)'];

    constructor() { super(new UserProfileDao()); }

    fetchSelectedFieldsFromLinkedIn(userId:number, profileFields:string[]):q.Promise<any>
    {
        var fields:string = profileFields.join(',');

        return new UserOAuthDelegate().find({'user_id': userId})
            .then(
            function detailsFetched(userOauth:UserOauth)
            {
                var deferred = q.defer();

                if (Utils.isNullOrEmpty(userOauth))
                    throw('No oauth entry found');

                var oauth = new OAuth.OAuth(
                    'https://www.linkedin.com/uas/oauth/authenticate?oauth_token=',
                    'https://api.linkedin.com/uas/oauth/accessToken',
                    Config.get(Config.LINKEDIN_API_KEY),
                    Config.get(Config.LINKEDIN_API_SECRET),
                    '1.0A',
                    null,
                    'HMAC-SHA1'
                );
                oauth.get(
                        'https://api.linkedin.com/v1/people/~:(' + fields + ')?format=json ',
                    userOauth.getAccessToken(),
                    userOauth.getRefreshToken(),
                    function (e, data, res)
                    {
                        if (e)
                            deferred.reject(e);
                        else
                        {
                            var profile = JSON.parse(data);
                            deferred.resolve(profile);
                        }
                    }
                );

                return deferred.promise;
            });

    }

    fetchEducationDetailsFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.EDUCATION_FIELDS)
            .then(
            function educationDetailsFetched(profile)
            {
                if (!Utils.isNullOrEmpty(profile.educations) && profile.educations._total > 0)
                {
                    return q.all(_.map(profile.educations.values, function (education:any)
                    {
                        var tempUserEducation:UserEducation = new UserEducation();
                        tempUserEducation.setSchoolName(education.schoolName);
                        tempUserEducation.setFieldOfStudy(education.fieldOfStudy);
                        tempUserEducation.setDegree(education.degree);
                        tempUserEducation.setActivities(education.activities);
                        tempUserEducation.setNotes(education.notes);
                        tempUserEducation.setStartYear(education.startDate ? education.startDate.year : null);
                        tempUserEducation.setEndYear(education.endDate ? education.endDate.year : null);

                        return new UserEducationDelegate().createUserEducation(tempUserEducation, profileId, transaction);
                    }));
                }
            })
            .fail(
            function educationDetailsFetchedError(error)
            {
                self.logger.error(error);
                throw(error);
            })
    }

    fetchEmploymentDetailsFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.POSITION_FIELDS)
            .then(
            function employmentDetailsFetched(profile)
            {
                if (!Utils.isNullOrEmpty(profile.positions) && profile.positions._total > 0)
                {
                    return q.all(_.map(profile.positions.values, function (position:any)
                    {
                        var tempUserEmployment:UserEmployment = new UserEmployment();
                        tempUserEmployment.setIsCurrent(position.isCurrent);
                        tempUserEmployment.setTitle(position.title);
                        tempUserEmployment.setSummary(position.summary);
                        tempUserEmployment.setCompany(position.company ? position.company.name : null);

                        if (!Utils.isNullOrEmpty(position.startDate))
                            if(position.startDate.month && position.startDate.year)
                                tempUserEmployment.setStartDate(moment(position.startDate.month + '/' +position.startDate.year).format('MM/YYYY').valueOf());
                            else if (position.startDate.year)
                                tempUserEmployment.setStartDate(moment(position.startDate.year).format('YYYY').valueOf());
                            else
                                tempUserEmployment.setStartDate(-1);

                        if (!position.isCurrent && !Utils.isNullOrEmpty(position.endDate))
                            if(position.endDate.month && position.endDate.year)
                                tempUserEmployment.setEndDate(moment(position.endDate.month + '/' +position.endDate.year).format('MM/YYYY').valueOf());
                            else if (position.endDate.year)
                                tempUserEmployment.setEndDate(moment(position.endDate.year).format('YYYY').valueOf());
                            else
                                tempUserEmployment.setEndDate(-1);

                        return new UserEmploymentDelegate().createUserEmployment(tempUserEmployment, profileId, transaction);
                    }));
                }
            })
            .fail(
            function employmentDetailsFetchedError(error)
            {
                self.logger.error(error);
                throw(error);
            })
    }

    fetchProfilePictureFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        return self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.IMAGE_FIELDS)
            .then(
            function imageDetailsFetched(profile)
            {
                var profilePictureUrl;
                if (profile.pictureUrls && profile.pictureUrls.values.length > 0)
                    profilePictureUrl = profile.pictureUrls.values[0];

                if (!Utils.isNullOrEmpty(profilePictureUrl))
                {
                    var tempProfilePicturePath = Config.get(Config.TEMP_IMAGE_PATH) + Math.random();
                    return new ImageDelegate().fetch(profilePictureUrl, tempProfilePicturePath)
                        .then(
                        function imageFetched()
                        {
                            var UserDelegate = require('../delegates/UserDelegate');
                            return new UserDelegate().processProfileImage(userId, tempProfilePicturePath);
                        })
                }
            })
            .fail(
            function imageDetailsFetchedError(error)
            {
                self.logger.error(error);
                throw(error);
            })
    }

    fetchSkillDetailsFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.SKILL_FIELDS)
            .then(
            function skillDetailsFetched(profile)
            {
                if (!Utils.isNullOrEmpty(profile.skills) && profile.skills._total > 0)
                    var tasks = _.map(profile.skills.values, function (skillObject:any)
                    {
                        return new SkillCodeDelegate().createSkillCodeFromLinkedIn(skillObject.skill.name, transaction)
                            .then(
                            function skillCodesCreated(createdSkillCodes:SkillCode)
                            {
                                var userSkill = new UserSkill();
                                userSkill.setSkillId(createdSkillCodes.getId())
                                return new UserSkillDelegate().createUserSkillWithMap(userSkill, profileId, transaction);
                            })
                    });
                return q.all(tasks);
            })
            .fail(
            function skillDetailsFetchedError(error)
            {
                self.logger.error(error);
                throw(error);
            })
    }

    fetchBasicDetailsFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return q.all([
            self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.BASIC_FIELDS),
            new IntegrationMemberDelegate().find({'user_id': userId, 'integration_id': integrationId}, null, null, transaction)
        ])
            .then(
            function basicDetailsFetched(...args)
            {
                var profile = args[0][0];
                var integrationMember:IntegrationMember = args[0][1];

                var userProfile:UserProfile = new UserProfile();
                userProfile.setShortDesc(profile.headline || '');
                userProfile.setLongDesc(profile.summary || '');
                userProfile.setIntegrationMemberId(integrationMember.getId());

                var user:User = new User();
                user.setFirstName(profile.firstName);
                user.setLastName(profile.lastName);
                if (!Utils.isNullOrEmpty(profile.dateOfBirth))
                {
                    var dob:string = profile.dateOfBirth.day + '-' + profile.dateOfBirth.month + '-' + profile.dateOfBirth.year;
                    user.setDateOfBirth(dob);
                }
                if (!Utils.isNullOrEmpty(profile.industry))
                {
                    var industry:string = profile.industry.toString().replace(/-|\/|\s/g, '_').toUpperCase();
                    user.setIndustry(IndustryCodes[industry]);
                }
                var UserDelegate = require('../delegates/UserDelegate');
                return q.all([
                    self.update({id: profileId}, userProfile, transaction),
                    new UserDelegate().update({id: userId}, user, transaction)
                ]);
            })
            .fail(
            function basicDetailsFetchError(error)
            {
                self.logger.error(error);
                throw(error);
            })
    }

    fetchAllDetailsFromLinkedIn(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return q.all([
            self.fetchBasicDetailsFromLinkedIn(userId, integrationId, profileId, transaction),
            self.fetchEducationDetailsFromLinkedIn(userId, integrationId, profileId, transaction),
            self.fetchEmploymentDetailsFromLinkedIn(userId, integrationId, profileId, transaction),
            self.fetchProfilePictureFromLinkedIn(userId, integrationId, profileId, transaction),
            self.fetchSkillDetailsFromLinkedIn(userId, integrationId, profileId, transaction)
        ]);
    }

    fetchAndReplaceEducation(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var userEducationDelegate = new UserEducationDelegate();

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return userEducationDelegate.search({'profileId': profileId})
            .then(
            function educationFetched(userEducation:UserEducation[])
            {
                //TODO: Check if this can be done in one statement using the IN clause of SQL
                return userEducationDelegate.delete({id: _.pluck(userEducation, UserEducation.ID), profileId: profileId}, transaction, false);
            })
            .then(
            function deleted()
            {
                return self.fetchEducationDetailsFromLinkedIn(userId, integrationId, profileId, transaction);
            })
    }

    fetchAndReplaceEmployment(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var userEmploymentDelegate = new UserEmploymentDelegate();

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return userEmploymentDelegate.search({'profileId': profileId})
            .then(
            function EmploymentFetched(userEmployment:UserEmployment[])
            {
                return userEmploymentDelegate.delete({id: _.pluck(userEmployment, UserEmployment.ID), profileId: profileId}, transaction, false);
            })
            .then(
            function deleted()
            {
                return self.fetchEmploymentDetailsFromLinkedIn(userId, integrationId, profileId, transaction);
            });
    }

    fetchAndReplaceSkill(userId:number, integrationId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        var userSkillDelegate = new UserSkillDelegate();
        return userSkillDelegate.search({'profileId': profileId})
            .then(
            function SkillFetched(userSkills:UserSkill[])
            {
                if()
                return userSkillDelegate.delete({id: _.pluck(userSkills, UserSkill.ID), profileId: profileId}, transaction, false);
            })
            .then(
            function deleted()
            {
                return self.fetchSkillDetailsFromLinkedIn(userId, integrationId, profileId, transaction);
            });
    }

    publishProfile(profileId:number, userId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        var userProfile:UserProfile = new UserProfile();
        userProfile.setStatus(ProfileStatus.APPROVED);

        return self.update({id: profileId}, userProfile, transaction)
            .then(
            function userUpdated()
            {
                var UserDelegate = require('../delegates/UserDelegate');
                return new UserDelegate().recalculateStatus(userId, transaction);
            }
        )
    }

    copyProfile(profileId:number, newProfileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return q.all([
            new UserProfileDelegate().get(profileId),
            new UserSkillDelegate().getSkillWithName(profileId),
            new UserEducationDelegate().search({'profileId': profileId}),
            new UserEmploymentDelegate().search({'profileId': profileId}),
            new UserUrlDelegate().search({'profileId': profileId})
        ])
            .then(
            function detailsFetched(...args)
            {
                var userProfile = args[0][0];
                var userSkills = args[0][1] || [];
                var userEducations = args[0][2] || [];
                var userEmployments = args[0][3] || [];
                var userUrls = args[0][4] || [];

                var createTasks = [];
                createTasks.push(new UserProfileDelegate().update({id: newProfileId}, userProfile, transaction));
                createTasks.push(_.each(userSkills, function (skill:UserSkill)
                {
                    return new UserSkillDelegate().createUserSkillWithMap(skill, newProfileId, transaction);
                }));
                createTasks.push(_.each(userEducations, function (edu:UserEducation)
                {
                    return new UserEducationDelegate().createUserEducation(edu, newProfileId, transaction);
                }));
                createTasks.push(_.each(userEmployments, function (emp:UserEmployment)
                {
                    return new UserEmploymentDelegate().createUserEmployment(emp, newProfileId, transaction);
                }));
                createTasks.push(_.each(userUrls, function (url:UserUrl)
                {
                    return new UserUrlDelegate().createUserUrl(url, newProfileId, transaction);
                }));

                return q.all(createTasks);
            })

    }

    create(object:any, transaction?:Object):q.Promise<any>
    {
        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(this, arguments);

        var createdProfile:UserProfile;

        return super.create(object, transaction)
            .then(
            function profileCreated(userProfile:UserProfile)
            {
                createdProfile = userProfile;
                return new IntegrationMemberDelegate().get(userProfile.getIntegrationMemberId(), null, null, transaction);
            })
            .then(
            function memberFetched(member:IntegrationMember)
            {
                var UserDelegate = require('../delegates/UserDelegate');
                return new UserDelegate().update(member.getUserId(), Utils.createSimpleObject(User.DEFAULT_PROFILE_ID, createdProfile.getId()), transaction)
            })
            .then(
            function userDefaultProfileUpdated()
            {
                return createdProfile;
            });
    }

}
export = UserProfileDelegate