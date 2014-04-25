import AbstractDao                  = require('./AbstractDao');
import MapProfileEmployment          = require('../models/MapProfileEmployment');

class MapProfileEmploymentDao extends AbstractDao
{
    constructor() { super(MapProfileEmployment); }
}
export = MapProfileEmploymentDao