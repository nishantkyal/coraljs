import _                            = require('underscore');
import q                            = require('q');
import BaseDaoDelegate              = require('./BaseDaoDelegate');
import PhoneCallReview              = require('../models/PhoneCallReviewModel');

class CallReviewDelegate extends BaseDaoDelegate
{
    constructor() { super(PhoneCallReview); }
}
export = CallReviewDelegate