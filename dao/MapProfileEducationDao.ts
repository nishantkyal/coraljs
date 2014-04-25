import AbstractDao                  = require('./AbstractDao');
import MapProfileEducation          = require('../models/MapProfileEducation');

class MapProfileEducationDao extends AbstractDao
{
    constructor() { super(MapProfileEducation); }
}
export = MapProfileEducationDao