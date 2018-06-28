"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _ = require("underscore");
var log4js = require("log4js");
var Utils = require("../common/Utils");
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
        return new Promise(function (resolve, reject) {
            self.solrClient.add(data, function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    self.solrClient.commit(function (err, obj) {
                        resolve(obj);
                    });
            });
        });
    };
    SolrDao.prototype.get = function (id, options) {
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
    };
    SolrDao.prototype.search = function (searchQuery, options) {
        if (options === void 0) { options = {}; }
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
        return new Promise(function (resolve, reject) {
            self.solrClient.search(solrQuery, function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    resolve(_.map(obj.response.docs, function (doc) {
                        return new self.modelClass(doc);
                    }));
            });
        });
    };
    SolrDao.prototype.find = function (searchQuery, options) {
        if (options === void 0) { options = {}; }
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
    };
    SolrDao.prototype.update = function (criteria, newValues) {
        return __awaiter(this, void 0, void 0, function () {
            var self, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.find(criteria, { fields: ['id', '_version_'] })];
                    case 1:
                        document = _a.sent();
                        newValues['_version_'] = document['_version_'];
                        newValues['id'] = document['id'];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                self.solrClient.add(newValues, function (err, obj) {
                                    if (!Utils.isNullOrEmpty(err))
                                        reject(err);
                                    else
                                        self.solrClient.commit(function (err, obj) {
                                            resolve(obj);
                                        });
                                });
                            })];
                }
            });
        });
    };
    SolrDao.prototype.delete = function (criteria) {
        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(criteria);
        var self = this;
        return new Promise(function (resolve, reject) {
            self.solrClient.deleteByQuery(solrQuery.build(), function (err, obj) {
                if (!Utils.isNullOrEmpty(err))
                    reject(err);
                else
                    resolve(obj);
            });
        });
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
}());
module.exports = SolrDao;
//# sourceMappingURL=SolrDao.js.map