import moment                                                   = require('moment');
import _                                                        = require('underscore');
import User                                                     = require('../models/User');
import Schedule                                                 = require('../models/Schedule');
import PricingScheme                                            = require('../models/PricingScheme');
import UserSkill                                                = require('../models/UserSkill');
import SkillCode                                                = require('../models/SkillCode');
import Salutation                                               = require('../enums/Salutation');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import Utils                                                    = require('../common/Utils');

/**
 * Lean and compact version of expert data for caching
 */
class WidgetExpert
{
    private user_id:number;                                              // Same as expert_id or integration_member_id
    private title:Salutation;
    private first_name:string;
    private last_name:string;
    private timezone:number;
    private timezone_offset:number;
    private pricing_scheme:PricingScheme;
    private user_rating:number;
    private editorial_rating:number;
    private summary:string;
    private keywords:string[];
    private next_slot_start_time:number;
    private next_slot_duration:number;

    constructor(expert:User, schedules:Schedule[]);
    constructor(expert:Object, schedules:Schedule[]);
    constructor(expert:any, schedules:Schedule[])
    {
        var self = this;

        if (Utils.getObjectType(expert) == 'User')
        {
            var user:User = expert;
            this.user_id = user.getId();
            this.title = user.getTitle();
            this.first_name = user.getFirstName();
            this.last_name = user.getLastName();
            this.timezone = user.getTimezone();

            var nextAvailableSchedule:Schedule = _.find(schedules, function (schedule:Schedule):boolean
            {
                var scheduleEndTime = schedule.getStartTime() + schedule.getDuration();
                return scheduleEndTime > moment().add({minutes: 15}).valueOf();
            });

            if (!Utils.isNullOrEmpty(nextAvailableSchedule))
            {
                this.next_slot_start_time = nextAvailableSchedule.getStartTime();
                this.next_slot_duration = nextAvailableSchedule.getDuration();
            }

            user.getSkills()
                .then(
                function userSkillsFetched(skills:UserSkill[]):any
                {
                    self.keywords = _.map(skills, function(skill:UserSkill)
                    {
                        return skill['skill'][SkillCode.COL_SKILL];
                    });
                });
        }
        else
        {
            this.user_id = expert.user_id;
            this.title = expert.title;
            this.first_name = expert.first_name;
            this.last_name = expert.last_name;
            this.timezone = expert.timezone;
            this.timezone_offset = expert.timezone_offset;
            this.next_slot_start_time = expert.next_slot_start_time;
            this.next_slot_duration = expert.next_slot_duration;
            this.pricing_scheme = expert.pricing_scheme;
        }
    }

    /* Getters */
    getId():number { return this.user_id; }
    getTitle():Salutation { return this.title; }
    getFirstName():string { return this.first_name; }
    getLastName():string { return this.last_name; }
    getTimezone():number { return this.timezone; }
    getTimezoneOffset():number { return this.timezone_offset; }
    getPricingScheme():PricingScheme { return this.pricing_scheme; }
    getUserRating():number { return this.user_rating; }
    getEditorialRating():number { return this.editorial_rating; }
    getSummary():string { return this.summary; }
    getKeywords():string[] { return this.keywords; }
    getNextSlotStartTime():number { return this.next_slot_start_time; }
    getNextSlotDuration():number { return this.next_slot_duration; }

    /* Setters */
    setTimezoneOffset(val:number) { this.timezone_offset = val; }
    setPricingScheme(val:PricingScheme) { this.pricing_scheme = val; }
}
export = WidgetExpert