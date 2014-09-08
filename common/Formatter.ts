///<reference path='../_references.d.ts'/>
import moment                                                       = require('moment');
import accounting                                                   = require('accounting');
import MoneyUnit                                                    = require('../enums/MoneyUnit');
import Salutation                                                   = require('../enums/Salutation');
import Utils                                                        = require('../common/Utils');

class Formatter
{
    static formatMoney(val:number, moneyUnit:MoneyUnit):string
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

        if (Utils.isNullOrEmpty(val))
            return '';
        else
            return val.toString();
    }


    static formatName(firstName:string, lastName?:string, title?:Salutation):string
    {
        return [Salutation[title], firstName, lastName].join(' ');
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

        if (isNegative)
            m = Math.abs(m);

        if (Utils.getObjectType(m) == 'String')
            if (m.search(/^[0-9]+$/) != -1)
                m = parseInt(m);
        return (isNegative ? '-' : '') + moment(m).format(format).toString();
    }



    static getNameInitials(firstName:string = ' ', lastName:string = ' '):string
    {
        firstName = firstName || ' ';
        lastName = lastName || ' ';
        return (firstName[0] + lastName[0]).toUpperCase();
    }

    static formatEmail(email:string, firstName?:string, lastName?:string, title?:Salutation):string
    {
        if (!Utils.isNullOrEmpty(firstName))
            return Formatter.formatName(firstName, lastName, title) + '<' + email + '>';
        return email;
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