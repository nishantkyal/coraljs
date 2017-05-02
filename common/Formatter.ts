///<reference path='../_references.d.ts'/>
import moment                                                       = require('moment');
import moment_timezone                                              = require('moment-timezone');
import Salutation                                                   = require('../enums/Salutation');
import Utils                                                        = require('../common/Utils');

class Formatter
{
    static formatName(firstName:string, lastName?:string, title?:Salutation):string
    {
        return [Salutation[title], firstName, lastName].join(' ').trim();
    }

    static formatDate(m:Date):string;
    static formatDate(m:string):string;
    static formatDate(m:number):string;
    static formatDate(m:any, format:string = 'DD/MM/YYYY hh:mm a', zone:string = 'Asia/Kolkata'):string
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

        return (isNegative ? '-' : '') + moment_timezone(m).tz(zone).format(format).toString();
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