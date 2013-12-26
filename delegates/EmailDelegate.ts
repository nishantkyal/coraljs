import Email        = require('../models/Email')
import IDao         = require('../dao/IDao');
import EmailDao     = require('../dao/EmailDao');

/**
 Delegate class for managing email
 1. Queue new email
 2. Check status of emails
 3. Search emails
 */
class EmailDelegate {
    getDao():IDao { return EmailDao; }
}
export = EmailDelegate