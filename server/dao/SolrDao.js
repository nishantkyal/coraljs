"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _ = require("underscore");
const log4js = require("log4js");
const Utils = require("../common/Utils");
class SolrDao {
    constructor(modelClass, solrClient) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        this.solrClient = solrClient;
        this.modelClass = modelClass;
        new modelClass();
    }
    create(data) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.solrClient.add(data, function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    self.solrClient.commit(function (err, obj) {
                        resolve(obj);
                    });
            });
        });
    }
    get(id, options) {
        var self = this;
        if (Utils.getObjectType(id) == 'Array' && id.length > 1)
            return this.search({ id: id }, options);
        else {
            if (Utils.getObjectType(id) == 'Array')
                id = id[0];
            return this.find({ id: id }, options)
                .then(function objectFetched(result) {
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
    }
    search(searchQuery, options = {}) {
        var self = this;
        var solrQuery = this.solrClient.createQuery();
        if (!Utils.isNullOrEmpty(options.max))
            solrQuery.rows(options.max);
        else
            solrQuery.rows(100);
        var queryStatements = self.generateWhereStatement(searchQuery);
        if (queryStatements.length == 0)
            throw ('Empty Search is not allowed.');
        else
            solrQuery.q(queryStatements.join(' AND '));
        if (!Utils.isNullOrEmpty(options.fields))
            solrQuery.fl(options.fields);
        if (!Utils.isNullOrEmpty(options.sort))
            _.each(options.sort, solrQuery.sort, solrQuery);
        return new Promise((resolve, reject) => {
            self.solrClient.search(solrQuery, function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    resolve(_.map(obj.response.docs, function (doc) {
                        return new self.modelClass(doc);
                    }));
            });
        });
    }
    find(searchQuery, options = {}) {
        var self = this;
        options.max = 1;
        return self.search(searchQuery, options)
            .then(function handleSearchResults(results) {
            if (!Utils.isNullOrEmpty(results))
                return results[0];
            else
                return results;
        }, function findError(error) {
            self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
            throw (error);
        });
    }
    update(criteria, newValues) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var document = yield self.find(criteria, { fields: ['id', '_version_'] });
            newValues['_version_'] = document['_version_'];
            newValues['id'] = document['id'];
            return new Promise((resolve, reject) => {
                self.solrClient.add(newValues, function (err, obj) {
                    if (!Utils.isNullOrEmpty(err))
                        reject(err);
                    else
                        self.solrClient.commit(function (err, obj) {
                            resolve(obj);
                        });
                });
            });
        });
    }
    delete(criteria) {
        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(criteria);
        var self = this;
        return new Promise((resolve, reject) => {
            self.solrClient.deleteByQuery(solrQuery.build(), function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    resolve(obj);
            });
        });
    }
    generateWhereStatement(criteria = {}) {
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
                        var values = value.split(' ');
                        _.each(values, function (val) {
                            whereStatement.push(key + ':*' + val + '* ');
                        });
                        break;
                }
            });
        }
        return whereStatement;
    }
}
module.exports = SolrDao;
//# sourceMappingURL=SolrDao.js.map