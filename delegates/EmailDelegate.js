var Email = require('../models/Email');

var EmailDao = require('../dao/EmailDao');

/**
Delegate class for managing email
1. Queue new email
2. Check status of emails
3. Search emails
*/
var EmailDelegate = (function () {
    function EmailDelegate() {
    }
    EmailDelegate.prototype.getDao = function () {
        return new EmailDao();
    };
    return EmailDelegate;
})();

module.exports = EmailDelegate;

//# sourceMappingURL=EmailDelegate.js.map
