import MapExpertiseSkill                                    = require('../models/MapExpertiseSkill');
import AbstractDao                                          = require('./AbstractDao');

class MapExpertiseSkillDao extends AbstractDao
{
    constructor(){ super(MapExpertiseSkill); }
}
export = MapExpertiseSkillDao