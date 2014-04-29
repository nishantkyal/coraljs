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
    search(searchQuery:Object, options?:Object, fields?:string[]):q.Promise<any>
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
            + '` ON '+ joinOn + ' WHERE ' + wheres.join(' AND ') ;

        return MysqlDelegate.executeQuery(queryString, values)
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
}
export = AbstractMappingDao