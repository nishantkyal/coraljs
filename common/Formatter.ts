///<reference path='../_references.d.ts'/>
import moment                                                       = require('moment');
import accounting                                                   = require('accounting');
import MoneyUnit                                                    = require('../enums/MoneyUnit');
import IntegrationMemberRole                                        = require('../enums/IntegrationMemberRole');
import ExpertSchedule                                               = require('../models/ExpertSchedule');

class Formatter
{
    static formatMoney(val:number, moneyUnit:MoneyUnit):string;
    static formatMoney(val:number[], moneyUnit:MoneyUnit):string;
    static formatMoney(val:any, moneyUnit:MoneyUnit):string
    {
        switch(moneyUnit)
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

    static formatName(firstName:string, lastName?:string, title?:string):string
    {
        return [title, firstName, lastName].join(' ');
    }

    static formatSchedule(schedule:ExpertSchedule):string
    {
        var endTime = moment(schedule['start_time']).add('seconds', schedule['duration']).format('h:mm A');
        var startTime = moment(schedule['start_time']).format('DD-MM-YYYY h:mm A');

        return startTime + ' ' + endTime;
    }
}
export = Formatter