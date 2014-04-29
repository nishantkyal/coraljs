import AbstractDao                  = require('./AbstractDao');
import MapProfileSkill              = require('../models/MapProfileSkill');

class MapProfileSkillDao extends AbstractDao
{
    constructor() { super(MapProfileSkill); }
}
export = MapProfileSkillDao