define(["require", "exports", 'moment-timezone', '../enums/Salutation', '../common/Utils'], function (require, exports, moment_timezone, Salutation, Utils) {
    var Formatter = (function () {
        function Formatter() {
        }
        Formatter.formatName = function (firstName, lastName, title) {
            return [Salutation[title], firstName, lastName].join(' ').trim();
        };
        Formatter.formatDate = function (m, format, zone) {
            if (format === void 0) { format = 'DD/MM/YYYY hh:mm a'; }
            if (zone === void 0) { zone = 'Asia/Kolkata'; }
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
        };
        Formatter.getNameInitials = function (firstName, lastName) {
            if (firstName === void 0) { firstName = ' '; }
            if (lastName === void 0) { lastName = ' '; }
            firstName = firstName || ' ';
            lastName = lastName || ' ';
            return (firstName[0] + lastName[0]).toUpperCase();
        };
        Formatter.formatEmail = function (email, firstName, lastName, title) {
            if (!Utils.isNullOrEmpty(firstName))
                return Formatter.formatName(firstName, lastName, title) + '<' + email + '>';
            return email;
        };
        Formatter.formatTimezone = function (offset) {
            var min = Math.floor(Math.abs(offset) / 60) % 60;
            var gmt_string;
            gmt_string = 'GMT' + (offset > 0 ? ' + ' : ' - ');
            gmt_string += Math.floor(Math.abs(offset) / 3600) + ':';
            gmt_string += min < 10 ? ('0' + min.toString()) : min.toString();
            return gmt_string;
        };
        return Formatter;
    })();
    return Formatter;
});
//# sourceMappingURL=Formatter.js.map