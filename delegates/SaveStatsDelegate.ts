import BaseDaoDelegate                                          = require('../delegates/BaseDaoDelegate');
import SaveStats                                                = require('../models/SaveStats');

class SaveStatsDelegate extends BaseDaoDelegate
{
    constructor() { super(SaveStats); }
}
export = SaveStatsDelegate