import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import UserReview                                               = require('../models/UserReview');

class UserReviewDelegate extends BaseDaoDelegate
{
    constructor() { super(UserReview); }
}
export = UserReviewDelegate