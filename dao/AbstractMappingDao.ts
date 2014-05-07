///<reference path='../_references.d.ts'/>
import mysql                                        = require('mysql');
import q                                            = require('q');
import _                                            = require('underscore');
import log4js                                       = require('log4js');
import MysqlDelegate                                = require('../delegates/MysqlDelegate')
import GlobalIdDelegate                             = require('../delegates/GlobalIDDelegate');
import BaseModel                                    = require('../models/BaseModel');
import AbstractModel                                = require('../models/AbstractModel');
import AbstractDao                                  = require('./AbstractDao');
import Utils                                        = require('../common/Utils');

class AbstractMappingDao extends AbstractDao
{
    search(searchQuery:Object, options?:Object, fields?:string[], transaction?:any):q.Promise<any>
    {
        var self = this;

        var profileId = searchQuery['profileId'];
        delete searchQuery['profileId'];
        var mappingFieldName = this.tableName.substr(this.tableName.lastIndexOf('_')+1,this.tableName.length);
        var mappingTableName = 'map_profile_' + mappingFieldName;
        var joinOn:string = this.tableName + '.id = ' + mappingTableName + '.' + mappingFieldName + '_id';
        searchQuery[mappingTableName + '.profile_id'] = profileId;

        var whereStatements = this.generateWhereStatements(searchQuery);
        var wheres = whereStatements.where;
        var values = whereStatements.values;
        var selectColumns = !Utils.isNullOrEmpty(fields) ? fields.join(',') : '*';

        var queryString = 'SELECT ' + selectColumns + ' FROM `' + this.tableName + '` INNER JOIN `' + mappingTableName
            + '` ON '+ joinOn + ' WHERE ' + wheres.join(' AND ') + ' AND (deleted IS NULL OR deleted = 0)';

        return MysqlDelegate.executeQuery(queryString, values, transaction)
            .then(
            function handleSearchResults(results:any[]):any
            {
                return _.map(results, function (result) { return new self.modelClass(result); });
            },
            function searchError(error)
            {
                self.logger.error('SEARCH failed for table: %s, criteria: %s, error: %s', self.tableName, searchQuery, JSON.stringify(error));
                throw(error);
            });
    }

    delete(criteria:any, transaction?:any):q.Promise<any>
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
                    function deleteFailed(error)
                    {
                        self.logger.error('DELETE failed for table: %s, criteria: %s, error: %s', self.tableName, criteria, JSON.stringify(error));
                        throw(error);
                    });
            })

    }

}
export = AbstractMappingDao