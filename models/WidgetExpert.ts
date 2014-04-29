import IntegrationMember                                        = require('../models/IntegrationMember');
import User                                                     = require('../models/User');
import Salutation                                               = require('../enums/Salutation');
import MoneyUnit                                                = require('../enums/MoneyUnit');
import Utils                                                    = require('../common/Utils');

/**
 * Lean and compact version of expert data for caching
*/
class WidgetExpert
{
    private id:number;                                              // Same as expert_id or integration_member_id
    private title:Salutation;
    private first_name:string;
    private last_name:string;
    private location:string;
    private tz:string;
    private price:number = 1; // TODO: Remove default value for price and unit
    private price_unit:MoneyUnit = MoneyUnit.DOLLAR;
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
        if (Utils.getObjectType(expert) == 'IntegrationMember')
        {
            this.id = expert.getId();

            var user:User = expert.getUser()[0];
            this.title = user.getTitle();
            this.first_name = user.getFirstName();
            this.last_name = user.getLastName();
            this.location = user.getLocation();
            this.tz = user.getTimezone();
        }
        else
        {
            this.title = expert.title;
        }

    }

    /* Getters */
    getId():number                                                  { return this.id; }
    getTitle():Salutation                                           { return this.title; }
    getFirstName():string                                           { return this.first_name; }
    getLastName():string                                            { return this.last_name; }
    getLocation():string                                            { return this.location; }
    getTz():string                                                  { return this.tz; }
    getPrice():number                                               { return this.price; }
    getPriceUnit():MoneyUnit                                        { return this.price_unit; }
    getUserRating():number                                          { return this.user_rating; }
    getEditorialRating():number                                     { return this.editorial_rating; }
    getSummary():string                                             { return this.summary; }
    getKeywords():string[]                                          { return this.keywords; }
    getNextSlotStartTime():number                                   { return this.next_slot_start_time; }
    getNextSlotDuration():number                                    { return this.next_slot_duration; }


}
export = WidgetExpert