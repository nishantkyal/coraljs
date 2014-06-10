///<reference path='../_references.d.ts'/>
import moment                                                       = require('moment');
import accounting                                                   = require('accounting');
import MoneyUnit                                                    = require('../enums/MoneyUnit');
import IntegrationMemberRole                                        = require('../enums/IntegrationMemberRole');
import UserStatus                                                   = require('../enums/UserStatus');
import CallStatus                                                   = require('../enums/CallStatus');
import Salutation                                                   = require('../enums/Salutation');
import ExpertSchedule                                               = require('../models/ExpertSchedule');
import User                                                         = require('../models/User');
import UserPhone                                                    = require('../models/UserPhone');
import Utils                                                        = require('../common/Utils');

class Formatter
{
    static formatMoney(val:number, moneyUnit:MoneyUnit):string;

    static formatMoney(val:number[], moneyUnit:MoneyUnit):string;

    static formatMoney(val:any, moneyUnit:MoneyUnit):string
    {
        switch (moneyUnit)
        {
            case MoneyUnit.PERCENT:
                return accounting.formatMoney(val, {
                    format: '%v %s',
                    precision: 2,
                    symbol: '%'
                });
            case MoneyUnit.DOLLAR:
                return accounting.formatMoney(val, {
                    format: '%s %v'
                });
            case MoneyUnit.RUPEE:
                return accounting.formatMoney(val, {
                    format: '%s %v',
                    symbol: 'Rs.'
                });
            case MoneyUnit.POINTS:
                return accounting.formatMoney(val, {
                    format: '%v %s',
                    precision: 2,
                    symbol: 'Points'
                });
        }
        return val;
    }

    static formatRole(role:IntegrationMemberRole):string
    {
        return IntegrationMemberRole[role];
    }

    static formatName(firstName:string, lastName?:string, title?:Salutation):string
    {
        return [Salutation[title], firstName, lastName].join(' ');
    }

    static formatSchedule(schedule:ExpertSchedule):string
    {
        var endTime = moment(schedule['start_time']).add('seconds', schedule['duration']).format('h:mm A');
        var startTime = moment(schedule['start_time']).format('DD-MM-YYYY h:mm A');

        return startTime + ' - ' + endTime;
    }

    static formatDate(m:Date):string;

    static formatDate(m:string):string;

    static formatDate(m:number):string;

    static formatDate(m:any, format:string = 'DD/MM/YYYY hh:mm a ZZ'):string
    {
        var isNegative = false;
        if (Utils.isNullOrEmpty(m))
            return m;

        var isNegative = Utils.getObjectType(m) == 'Number' && m < 0;
        m = Math.abs(m);

        if (Utils.getObjectType(m) == 'String')
            if (m.search(/^[0-9]+$/) != -1)
                m = parseInt(m);
        return (isNegative ? '-' : '') + moment(m).format(format).toString();
    }

    static formatUserStatus(status:UserStatus):string
    {
        return Utils.enumToNormalText(UserStatus)[status];
    }

    static formatCallStatus(status:CallStatus):string
    {
        return Utils.enumToNormalText(CallStatus)[status];
    }

    static formatUserName(user:User, includeEmail:boolean = false):string
    {
        if (includeEmail)
            return Formatter.formatEmail(user.getEmail(), user.getFirstName(), user.getLastName(), user.getTitle());
        return Formatter.formatName(user.getFirstName(), user.getLastName(), user.getTitle());
    }

    static formatEmail(email:string, firstName?:string, lastName?:string, title?:Salutation):string
    {
        if (!Utils.isNullOrEmpty(firstName))
            return Formatter.formatName(firstName, lastName, title) + '<' + email + '>';
        return email;
    }

    static formatPhone(phone:UserPhone):string
    {
        return phone.getCompleteNumber();
    }

    static formatTimezone(offset):string
    {
        var min = Math.floor(Math.abs(offset)/60)%60;
        var gmt_string:string;

        gmt_string = 'GMT' + (offset > 0 ? ' + ' : ' - ') ;
        gmt_string += Math.floor(Math.abs(offset)/3600) + ':';
        gmt_string +=  min < 10 ? ('0' + min.toString()) : min.toString();

        return gmt_string;
    }
}
export = Formatter