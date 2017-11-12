"use strict";
const moment_timezone = require("moment-timezone");
const Salutation = require("../enums/Salutation");
const Utils = require("../common/Utils");
class Formatter {
    static formatName(firstName, lastName, title) {
        return [Salutation[title], firstName, lastName].join(' ').trim();
    }
    static formatDate(m, format = 'DD/MM/YYYY hh:mm a', zone = 'Asia/Kolkata') {
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
    static getNameInitials(firstName = ' ', lastName = ' ') {
        firstName = firstName || ' ';
        lastName = lastName || ' ';
        return (firstName[0] + lastName[0]).toUpperCase();
    }
    static formatEmail(email, firstName, lastName, title) {
        if (!Utils.isNullOrEmpty(firstName))
            return Formatter.formatName(firstName, lastName, title) + '<' + email + '>';
        return email;
    }
    static formatTimezone(offset) {
        var min = Math.floor(Math.abs(offset) / 60) % 60;
        var gmt_string;
        gmt_string = 'GMT' + (offset > 0 ? ' + ' : ' - ');
        gmt_string += Math.floor(Math.abs(offset) / 3600) + ':';
        gmt_string += min < 10 ? ('0' + min.toString()) : min.toString();
        return gmt_string;
    }
}
module.exports = Formatter;
//# sourceMappingURL=Formatter.js.map