///<reference path='../_references.d.ts'/>
import passport                                 = require('passport');
import passport_linkedin                        = require('passport-linkedin');
import q                                        = require('q');
import BaseDaoDelegate                          = require('./BaseDaoDelegate');
import UserEmploymentDelegate                   = require('../delegates/UserEmploymentDelegate');
import UserEducationDelegate                    = require('../delegates/UserEducationDelegate');
import UserSkillDelegate                        = require('../delegates/UserSkillDelegate');
import SkillCodeDelegate                        = require('../delegates/SkillCodeDelegate');
import UserDelegate                             = require('../delegates/UserDelegate');
import UserOAuthDelegate                        = require('../delegates/UserOAuthDelegate');
import ImageDelegate                            = require('../delegates/ImageDelegate');
import UserProfileDao                           = require('../dao/UserProfileDao');
import UserProfile                              = require('../models/UserProfile');
import UserSkill                                = require('../models/UserSkill');
import UserEmployment                           = require('../models/UserEmployment');
import UserEducation                            = require('../models/UserEducation');
import SkillCode                                = require('../models/SkillCode');
import User                                     = require('../models/User');
import Config                                   = require('../common/Config');
import Utils                                    = require('../common/Utils');

class UserProfileDelegate extends BaseDaoDelegate
{
    static STRATEGY_LINKEDIN:string = 'linkedin';
    constructor() { super(new UserProfileDao()); }

    fetchFromLinkedIn(userId:number, integrationId:number, transaction?:any):q.Promise<any>
    {
        var self = this;
        var profileFields:string[] = ['id', 'first-name', 'last-name', 'email-address', 'headline',
            'industry', 'summary', 'positions', 'picture-urls::(original)', 'skills', 'educations', 'date-of-birth'];
        passport.use(UserProfileDelegate.STRATEGY_LINKEDIN, new passport_linkedin.Strategy({
                consumerKey: Config.get(Config.LINKEDIN_API_KEY),
                consumerSecret: Config.get(Config.LINKEDIN_API_SECRET),
                callbackURL: callbackUrl,
                profileFields: profileFields
            },
            function (accessToken, refreshToken, profile:any, done)
            {
                profile = profile['_json'];
                var userProfile:UserProfile = new UserProfile();
                var profileId:number;
                userProfile.setShortDesc(profile.headline);
                userProfile.setLongDesc(profile.summary);
                userProfile.setIntegrationMemberId(integrationId);
                return self.create(userProfile)
                    .then(
                    function updateFieldsFromLinkedIn(userProfileCreated:UserProfile)
                    {
                        var updateProfileTasks = [];

                        // Fetch and process profile image if available
                        var profilePictureUrl;
                        if (profile.pictureUrls && profile.pictureUrls.values.length > 0)
                            profilePictureUrl = profile.pictureUrls.values[0];

                        if (!Utils.isNullOrEmpty(profilePictureUrl))
                        {
                            var tempProfilePicturePath = Config.get(Config.TEMP_IMAGE_PATH) + Math.random();
                            updateProfileTasks.push(new ImageDelegate().fetch(profilePictureUrl, tempProfilePicturePath)
                                .then(
                                function imageFetched()
                                {
                                    return new UserDelegate().processProfileImage(userId, tempProfilePicturePath);
                                })
                            );
                        }

                        // Update skills
                        if (!Utils.isNullOrEmpty(profile.skills) && profile.skills._total > 0)
                            updateProfileTasks = updateProfileTasks.concat(
                                new SkillCodeDelegate().createSkillCodeFromLinkedIn(_.map(profile.skills.values, function (skillObject:any)
                                    {
                                        return skillObject.skill.name;
                                    }))
                                    .then(
                                    function skillCodesCreated(createdSkillCodes:SkillCode[])
                                    {
                                        var userSkills = _.map(createdSkillCodes, function (skillCode:SkillCode)
                                        {
                                            var userSkill = new UserSkill();
                                            userSkill.setSkillId(skillCode.getId())
                                            return userSkill;
                                        });
                                        return new UserSkillDelegate().create(userSkills);
                                    })
                            );

                        // Update employment
                        if (!Utils.isNullOrEmpty(profile.positions) && profile.positions._total > 0)
                        {
                            updateProfileTasks = updateProfileTasks.concat(_.map(profile.positions.values, function (position:any)
                            {
                                var tempUserEmployment:UserEmployment = new UserEmployment();
                                tempUserEmployment.setIsCurrent(position.isCurrent);
                                tempUserEmployment.setTitle(position.title);
                                tempUserEmployment.setSummary(position.summary);
                                tempUserEmployment.setCompany(position.company ? position.company.name : null);

                                if (!Utils.isNullOrEmpty(position.startDate))
                                    tempUserEmployment.setStartDate((position.startDate.month || 1) + '-' + (position.startDate.year || null));

                                if (!position.isCurrent && !Utils.isNullOrEmpty(position.endDate))
                                    tempUserEmployment.setEndDate((position.endDate.month || 12) + '-' + (position.endDate.year || null));

                                return new UserEmploymentDelegate().createUserEmployment(tempUserEmployment,profileId);
                            }));
                        }

                        // Update education
                        if (!Utils.isNullOrEmpty(profile.educations) && profile.educations._total > 0)
                        {
                            updateProfileTasks = updateProfileTasks.concat(_.map(profile.educations.values, function (education:any)
                            {
                                var tempUserEducation:UserEducation = new UserEducation();
                                tempUserEducation.setSchoolName(education.schoolName);
                                tempUserEducation.setFieldOfStudy(education.fieldOfStudy);
                                tempUserEducation.setDegree(education.degree);
                                tempUserEducation.setActivities(education.activities);
                                tempUserEducation.setNotes(education.notes);
                                tempUserEducation.setStartYear(education.startDate ? education.startDate.year : null);
                                tempUserEducation.setEndYear(education.endDate ? education.endDate.year : null);

                                return new UserEducationDelegate().create(tempUserEducation);
                            }));
                        }
                        return q.all(updateProfileTasks);
                    });
            }
        ))
    }
}
export = UserProfileDelegate