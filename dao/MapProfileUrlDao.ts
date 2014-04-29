import AbstractDao                  = require('./AbstractDao');
import MapProfileUrl                = require('../models/MapProfileUrl');

class MapProfileUrlDao extends AbstractDao
{
    constructor() { super(MapProfileUrl); }
}
export = MapProfileUrlDao