///<reference path='../_references.d.ts'/>
import _                                        = require('underscore');
import moment                                   = require('moment');
import passport                                 = require('passport');
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
import Credentials                              = require('../common/Credentials');
import Utils                                    = require('../common/Utils');
import IndustryCodes                            = require('../enums/IndustryCode');
import IncludeFlag                              = require('../enums/IncludeFlag');

class UserProfileDelegate extends BaseDaoDelegate
{
    static BASIC_FIELDS:string[] = ['id', 'first-name', 'last-name', 'email-address', 'headline', 'industry', 'summary', 'date-of-birth'];
    static EDUCATION_FIELDS:string[] = ['educations'];
    static POSITION_FIELDS:string[] = ['positions'];
    static SKILL_FIELDS:string[] = ['skills'];
    static IMAGE_FIELDS:string[] = ['picture-urls::(original)'];

    constructor() { super(UserProfile); }

    create(object:Object, dbTransaction?:Object):q.Promise<any>
    {
        var self = this;
        var profile;

        return super.create(object, dbTransaction)
            .then(
            function profileCreated(createdProfile:UserProfile)
            {
                profile = createdProfile;
                return self.fetchAllDetailsFromLinkedIn(createdProfile.getUserId(), createdProfile.getId(), dbTransaction);
            })
            .fail(
            function linkedInFetchFailed(error)
            {
                self.logger.debug('LinkedIn profile fetch failed for user id: %s, error: %s', profile.getUserId(), JSON.stringify(error));
                return profile;
            });
    }

    find(criteria:Object, fields?:string[], includes:IncludeFlag[] = [], dbTransaction?:Object):q.Promise<any>
    {
        var self = this;

        return super.find(criteria, fields, includes, dbTransaction)
            .then(
            function profileFetched(profile:UserProfile):any
            {
                if (Utils.isNullOrEmpty(profile) && criteria.hasOwnProperty(UserProfile.USER_ID))
                {
                    var profile = new UserProfile();
                    profile.setUserId(criteria[UserProfile.USER_ID]);

                    return self.create(profile, dbTransaction);
                }
                else
                    return profile;
            });
    }

    fetchSelectedFieldsFromLinkedIn(userId:number, profileFields:string[]):q.Promise<any>
    {
        var fields:string = profileFields.join(',');

        return new UserOAuthDelegate().find({'user_id': userId})
            .then(
            function detailsFetched(userOauth:UserOauth)
            {
                var deferred = q.defer();

                if (Utils.isNullOrEmpty(userOauth))
                    throw(new Error('No oauth entry found, user id: ' + userId));

                var oauth = new OAuth.OAuth(
                    'https://www.linkedin.com/uas/oauth/authenticate?oauth_token=',
                    'https://api.linkedin.com/uas/oauth/accessToken',
                    Credentials.get(Credentials.LINKEDIN_API_KEY),
                    Credentials.get(Credentials.LINKEDIN_API_SECRET),
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

    fetchEducationDetailsFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
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

    fetchEmploymentDetailsFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
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
                            if (position.startDate.month && position.startDate.year)
                                tempUserEmployment.setStartDate(moment(position.startDate.month + ' ' + position.startDate.year, 'MM YYYY').valueOf());
                            else
                                tempUserEmployment.setStartDate(-1);

                        if (!position.isCurrent && !Utils.isNullOrEmpty(position.endDate))
                            if (position.endDate.month && position.endDate.year)
                                tempUserEmployment.setEndDate(moment(position.endDate.month + ' ' + position.endDate.year, 'MM YYYY').valueOf());
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

    fetchProfilePictureFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
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

    fetchSkillDetailsFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
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

    fetchBasicDetailsFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        self.logger.debug('Fetching basic details for userId: %s', userId);

        return self.fetchSelectedFieldsFromLinkedIn(userId, UserProfileDelegate.BASIC_FIELDS)
            .then(
            function basicDetailsFetched(profile:any)
            {
                var userProfile:UserProfile = new UserProfile();
                userProfile.setShortDesc(profile.headline || '');
                userProfile.setLongDesc(profile.summary || '');
                userProfile.setUserId(userId);

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

    fetchAllDetailsFromLinkedIn(userId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        self.logger.debug('Fetching all details for userId: %s', userId);

        return q.all([
            self.fetchBasicDetailsFromLinkedIn(userId, profileId, transaction),
            self.fetchEducationDetailsFromLinkedIn(userId, profileId, transaction),
            self.fetchEmploymentDetailsFromLinkedIn(userId, profileId, transaction),
            self.fetchProfilePictureFromLinkedIn(userId, profileId, transaction),
            self.fetchSkillDetailsFromLinkedIn(userId, profileId, transaction)
        ]);
    }

    fetchAndReplaceEducation(userId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var userEducationDelegate = new UserEducationDelegate();

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return userEducationDelegate.search({'profileId': profileId})
            .then(
            function educationFetched(userEducation:UserEducation[]):any
            {
                if (userEducation && userEducation.length > 0)
                //TODO: Check if this can be done in one statement using the IN clause of SQL
                    return userEducationDelegate.delete({id: _.pluck(userEducation, UserEducation.ID), profileId: profileId}, transaction, false);
                else
                    return false;
            })
            .then(
            function deleted()
            {
                return self.fetchEducationDetailsFromLinkedIn(userId, profileId, transaction);
            })
    }

    fetchAndReplaceEmployment(userId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;
        var userEmploymentDelegate = new UserEmploymentDelegate();

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        return userEmploymentDelegate.search({'profileId': profileId})
            .then(
            function EmploymentFetched(userEmployment:UserEmployment[]):any
            {
                if (userEmployment && userEmployment.length > 0)
                    return userEmploymentDelegate.delete({id: _.pluck(userEmployment, UserEmployment.ID), profileId: profileId}, transaction, false);
                else
                    return false;
            })
            .then(
            function deleted()
            {
                return self.fetchEmploymentDetailsFromLinkedIn(userId, profileId, transaction);
            });
    }

    fetchAndReplaceSkill(userId:number, profileId:number, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.isNullOrEmpty(transaction))
            return MysqlDelegate.executeInTransaction(self, arguments);

        var userSkillDelegate = new UserSkillDelegate();
        return userSkillDelegate.search({'profileId': profileId})
            .then(
            function SkillFetched(userSkills:UserSkill[]):any
            {
                if (userSkills && userSkills.length > 0)
                    return userSkillDelegate.delete({id: _.pluck(userSkills, UserSkill.ID), profileId: profileId}, transaction, false);
                else
                    return false;
            })
            .then(
            function deleted()
            {
                return self.fetchSkillDetailsFromLinkedIn(userId, profileId, transaction);
            });
    }

}
export = UserProfileDelegate