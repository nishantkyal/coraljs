import q                                                        = require('q');
import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import Expertise                                                = require('../models/Expertise');
import IncludeFlag                                              = require('../enums/IncludeFlag');

class ExpertiseDelegate extends BaseDaoDelegate
{
    constructor() { super(Expertise); }
}
export = ExpertiseDelegate