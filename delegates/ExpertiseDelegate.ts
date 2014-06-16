import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import Expertise                                                = require('../models/Expertise');

class ExpertiseDelegate extends BaseDaoDelegate
{
    constructor() { super(Expertise); }
}
export = ExpertiseDelegate