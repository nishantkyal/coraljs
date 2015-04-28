///<reference path='../_references.d.ts'/>
var q = require('q');
var _ = require('underscore');
var log4js = require('log4js');
var Utils = require('../common/Utils');
var SolrDao = (function () {
    function SolrDao(modelClass, solrClient) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.solrClient = solrClient;
        this.modelClass = modelClass;
        // Instantiate model once so that foreign keys etc get computed
        new modelClass();
    }
    SolrDao.prototype.create = function (data) {
        var self = this;
        var deferred = q.defer();
        this.solrClient.add(data, function (err, obj) {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                self.solrClient.commit(function (err, obj) {
                    deferred.resolve(obj);
                });
        });
        return deferred.promise;
    };
    SolrDao.prototype.get = function (id, options) {
        var self = this;
        if (Utils.getObjectType(id) == 'Array' && id.length > 1)
            return this.search({ id: id }, options);
        else {
            if (Utils.getObjectType(id) == 'Array')
                id = id[0];
            return this.find({ id: id }, options).then(function objectFetched(result) {
                if (Utils.isNullOrEmpty(result)) {
                    var errorMessage = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                    self.logger.debug('No %s found for id: %s', self.tableName, id);
                    throw new Error(errorMessage);
                }
                else
                    return result;
            }, function objectFetchError(error) {
                self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                throw (error);
            });
        }
    };
    SolrDao.prototype.search = function (searchQuery, options) {
        if (options === void 0) { options = {}; }
        var deferred = q.defer();
        var self = this;
        var solrQuery = this.solrClient.createQuery();
        if (!Utils.isNullOrEmpty(options.max))
            solrQuery.rows(options.max);
        else
            solrQuery.rows(100);
        var queryStatements = self.generateWhereStatement(searchQuery);
        if (queryStatements.length == 0)
            deferred.reject('Empty Search is not allowed.');
        else
            solrQuery.q(queryStatements.join(' AND '));
        if (!Utils.isNullOrEmpty(options.fields))
            solrQuery.fl(options.fields);
        if (!Utils.isNullOrEmpty(options.sort))
            _.each(options.sort, solrQuery.sort, solrQuery);
        this.solrClient.search(solrQuery, function (err, obj) {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(_.map(obj['response']['docs'], function (doc) {
                    return new self.modelClass(doc);
                }));
        });
        return deferred.promise;
    };
    SolrDao.prototype.find = function (searchQuery, options) {
        if (options === void 0) { options = {}; }
        var self = this;
        options.max = 1;
        return self.search(searchQuery, options).then(function handleSearchResults(results) {
            if (!Utils.isNullOrEmpty(results))
                return results[0];
            else
                return results;
        }, function findError(error) {
            self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
            throw (error);
        });
    };
    SolrDao.prototype.update = function (criteria, newValues) {
        var deferred = q.defer();
        var self = this;
        self.find(criteria, { fields: ['id', '_version_'] }).then(function documentFetched(document) {
            //newValues = newValues.toJson();
            newValues['_version_'] = document['_version_'];
            newValues['id'] = document['id'];
            self.solrClient.add(newValues, function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    deferred.reject(err);
                else
                    self.solrClient.commit(function (err, obj) {
                        deferred.resolve(obj);
                    });
            });
        });
        return deferred.promise;
    };
    SolrDao.prototype.delete = function (criteria) {
        var deferred = q.defer();
        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(criteria);
        this.solrClient.deleteByQuery(solrQuery.build(), function (err, obj) {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(obj);
        });
        return deferred.promise;
    };
    /** Helper method to convert query objects to SQL fragments **/
    SolrDao.prototype.generateWhereStatement = function (criteria) {
        if (criteria === void 0) { criteria = {}; }
        var self = this;
        var whereStatement = [];
        for (var key in criteria) {
            var query = criteria[key];
            _.each(query, function (value) {
                switch (Utils.getObjectType(value)) {
                    case 'Object':
                        var operator = value['operator'];
                        if (operator && operator.toLowerCase() === 'lessthan')
                            whereStatement.push(key + ':[' + value['value'] + ' TO *] ');
                        else if (operator && operator.toLowerCase() === 'greaterthan')
                            whereStatement.push(key + ':[* TO ' + value['value'] + '] ');
                        break;
                    case 'Number':
                        whereStatement.push(key + ':' + value);
                        break;
                    case 'String':
                        var values = value.split(' '); //TODO configure solr to support whitespace and * search together
                        _.each(values, function (val) {
                            whereStatement.push(key + ':*' + val + '* ');
                        });
                        break;
                }
            });
        }
        return whereStatement;
    };
    return SolrDao;
})();
module.exports = SolrDao;
//# sourceMappingURL=SolrDao.js.map