import q                                        = require('q');
import _                                        = require('underscore');
import MysqlDelegate                            = require('../delegates/MysqlDelegate');
import AbstractDao                              = require('./AbstractDao');
import BaseModel                                = require('../models/BaseModel');
import UserSkill                                = require('../models/UserSkill');
import Utils                                    = require('../common/Utils');

class ExpertiseSkillDao extends AbstractDao
{
    constructor() { super(UserSkill); }

    delete(criteria:any, transaction?:Object):q.Promise<any>
    {
        var self = this;

        if (Utils.getObjectType(criteria) == 'Number')
            criteria = {id: criteria};

        var profileId = criteria['profileId'];
        delete criteria['profileId'];

        return super.delete(criteria, transaction)
            .then(function deleted(){
                var mappingFieldName = self.tableName.substr(self.tableName.lastIndexOf('_')+1,self.tableName.length);
                var mappingFieldId = criteria['id'];
                var mappingTableName = 'map_profile_' + mappingFieldName;

                var newCriteria = {};
                newCriteria['profile_id'] = profileId;
                newCriteria[mappingFieldName+'_id'] = mappingFieldId;

                var whereStatements = self.generateWhereStatements(newCriteria);
                var wheres = whereStatements.where;
                var values = whereStatements.values;

                var query = 'DELETE FROM `' + mappingTableName + '` WHERE ' + wheres.join(' AND ');

                return MysqlDelegate.executeQuery(query, values, transaction)
                    .fail(
                    function deleteFailed(error:Error)
                    {
                        self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, criteria, JSON.stringify(error));
                        throw(error);
                    });
            })

    }
}
export = ExpertiseSkillDao