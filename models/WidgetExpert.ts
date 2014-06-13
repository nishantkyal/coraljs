import moment                                                   = require('moment');
import _                                                        = require('underscore');
import IntegrationMember                                        = require('../models/IntegrationMember');
import User                                                     = require('../models/User');
import ExpertSchedule                                           = require('../models/ExpertSchedule');
import Salutation                                               = require('../enums/Salutation');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import TimeZone                                                 = require('../enums/TimeZone');
import Utils                                                    = require('../common/Utils');

/**
 * Lean and compact version of expert data for caching
 */
class WidgetExpert
{
    private expert_id:number;                                              // Same as expert_id or integration_member_id
    private user_id:number;                                              // Same as expert_id or integration_member_id
    private title:Salutation;
    private first_name:string;
    private last_name:string;
    private timezone:TimeZone;
    private timezone_offset:number;
    private price:number;
    private price_unit:MoneyUnit;
    private min_duration:number;
    private user_rating:number;
    private editorial_rating:number;
    private summary:string;
    private keywords:string[];
    private next_slot_start_time:number;
    private next_slot_duration:number;

    constructor(expert:IntegrationMember);

    constructor(expert:Object);

    constructor(expert:any)
    {
        var self = this;

        if (Utils.getObjectType(expert) == 'IntegrationMember')
        {
            var member:IntegrationMember = expert;
            var user:User = member.getUser();

            this.expert_id = member.getId();
            this.user_id = user.getId();
            this.title = user.getTitle();
            this.first_name = user.getFirstName();
            this.last_name = user.getLastName();
            this.timezone = user.getTimezone();

            if (member.getSchedule() && member.getSchedule()[0])
            {
                this.price = member.getSchedule()[0].getPricePerMin();
                this.price_unit = member.getSchedule()[0].getPriceUnit();
                this.min_duration = member.getSchedule()[0].getMinDuration();
            }

            var nextAvailableSchedule:ExpertSchedule = _.find(member.getSchedule(), function (schedule:ExpertSchedule):boolean
            {
                var scheduleEndTime = schedule.getStartTime() + schedule.getDuration();
                return scheduleEndTime > moment().add({minutes: 15}).valueOf();
            });

            if (!Utils.isNullOrEmpty(nextAvailableSchedule))
            {
                this.next_slot_start_time = nextAvailableSchedule.getStartTime();
                this.next_slot_duration = nextAvailableSchedule.getDuration();
            }
        }
        else
        {
            this.expert_id = expert.expert_id;
            this.user_id = expert.user_id;
            this.title = expert.title;
            this.first_name = expert.first_name;
            this.last_name = expert.last_name;
            this.timezone = expert.timezone;
            this.timezone_offset = expert.timezone_offset;
            this.next_slot_start_time = expert.next_slot_start_time;
            this.next_slot_duration = expert.next_slot_duration;
            this.price = expert.price;
            this.price_unit = expert.price_unit;
            this.min_duration = expert.min_duration;
        }
    }

    /* Getters */
    getId():number { return this.expert_id; }
    getTitle():Salutation { return this.title; }
    getFirstName():string { return this.first_name; }
    getLastName():string { return this.last_name; }
    getTimezone():TimeZone { return this.timezone; }
    getTimezoneOffset():number { return this.timezone_offset; }
    getPrice():number { return this.price; }
    getPriceUnit():MoneyUnit { return this.price_unit; }
    getUserRating():number { return this.user_rating; }
    getEditorialRating():number { return this.editorial_rating; }
    getSummary():string { return this.summary; }
    getKeywords():string[] { return this.keywords; }
    getNextSlotStartTime():number { return this.next_slot_start_time; }
    getNextSlotDuration():number { return this.next_slot_duration; }
    getMinDuration():number { return this.min_duration; }

    /* Setters */
    setTimezoneOffset(val:number) { this.timezone_offset = val; }
}
export = WidgetExpert