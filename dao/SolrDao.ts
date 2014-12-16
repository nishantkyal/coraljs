///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import _                                            = require('underscore');
import log4js                                       = require('log4js');
import solr_client                                  = require('solr-client');
import http                                         = require('http');
import IDao                                         = require('../dao/IDao');
import IDaoFetchOptions                             = require('../dao/IDaoFetchOptions');
import AbstractModel                                = require('../models/AbstractModel');
import Utils                                        = require('../common/Utils');

class SolrDao implements IDao
{
    private solrClient:Solr.SolrClient;
    public modelClass:typeof AbstractModel;
    public tableName:string;
    public logger:log4js.Logger = log4js.getLogger(Utils.getClassName(this));

    constructor(modelClass:typeof AbstractModel, solrClient:Solr.SolrClient)
    {
        this.solrClient = solrClient;
        this.modelClass = modelClass;

        // Instantiate model once so that foreign keys etc get computed
        new modelClass();
    }

    create(data:Object[]):q.Promise<any>;
    create(data:Object):q.Promise<any>;
    create(data:any):q.Promise<any>
    {
        var deferred = q.defer<any>();

        this.solrClient.add(data.toJson(), function(err:Error, obj:Object)
        {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(obj);
        });

        return deferred.promise;
    }

    get(id:any, options?:IDaoFetchOptions):q.Promise<any>;
    get(id:number, options?:IDaoFetchOptions):q.Promise<any>;
    get(id:any, options?:IDaoFetchOptions):q.Promise<any>
    {
        var self = this;
        if (Utils.getObjectType(id) == 'Array' && id.length > 1)
            return this.search({id: id}, options);
        else
        {
            if (Utils.getObjectType(id) == 'Array')
                id = id[0];

            return this.find({id: id}, options)
                .then(
                function objectFetched(result:any)
                {
                    if (Utils.isNullOrEmpty(result))
                    {
                        var errorMessage:string = 'No ' + self.tableName.replace('_', ' ') + ' found for id: ' + id;
                        self.logger.debug('No %s found for id: %s', self.tableName, id);
                        throw new Error(errorMessage);
                    }
                    else
                        return result;
                },
                function objectFetchError(error:Error)
                {
                    self.logger.error('GET failed table: %s, id: %s', self.tableName, id);
                    throw(error);
                });
        }
    }

    search(searchQuery:Object, options:IDaoFetchOptions = {}):q.Promise<any>
    {
        var deferred = q.defer<any>();
        var self = this;
        var solrQuery = this.solrClient.createQuery();
        solrQuery.rows(100);

        var queryStatements = self.generateWhereStatement(searchQuery);

        if(queryStatements.length == 0)
            deferred.reject('Empty Search is not allowed.');
        else
            solrQuery.q(queryStatements.join(' AND '));

        if (!Utils.isNullOrEmpty(options.fields))
            solrQuery.fl(options.fields);

        if (!Utils.isNullOrEmpty(options.sort))
            _.each(options.sort, solrQuery.sort, solrQuery);

        this.solrClient.search(solrQuery, function(err:Error, obj:Object)
        {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(_.map(obj['response']['docs'], function(doc)
                {
                    return new self.modelClass(doc);
                }));
        });

        return deferred.promise;
    }

    find(searchQuery:Object, options:IDaoFetchOptions = {}):q.Promise<any>
    {
        var self = this;
        options.max = 1;

        return self.search(searchQuery, options)
            .then(
            function handleSearchResults(results:Object[]):any
            {
                if (!Utils.isNullOrEmpty(results))
                    return results[0];
                else
                    return results;
            },
            function findError(error:Error)
            {
                self.logger.error('FIND failed for table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                throw(error);
            });
    }

    update(criteria:number, newValues:any):q.Promise<any>;
    update(criteria:Object, newValues:any):q.Promise<any>;
    update(criteria:any, newValues:any):q.Promise<any>
    {
        var deferred = q.defer<any>();
        var self = this;

        self.find(criteria, {fields: ['id', '_version_']})
            .then(
            function documentFetched(document)
            {
                newValues = newValues.toJson();
                newValues['_version_'] = document['_version_'];
                newValues['id'] = document['id'];

                self.solrClient.add(newValues, function(err:Error, obj:Object)
                {
                    if (!Utils.isNullOrEmpty(err))
                        deferred.reject(err);
                    else
                        self.solrClient.commit(function(err:Error, obj:Object)
                        {
                            deferred.resolve(obj);
                        });
                });
            });

        return deferred.promise;
    }

    delete(criteria:number):q.Promise<any>;
    delete(criteria:Object):q.Promise<any>;
    delete(criteria:any):q.Promise<any>
    {
        var deferred = q.defer<any>();

        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(criteria);

        this.solrClient.deleteByQuery(solrQuery.build(), function(err:Error, obj:Object)
        {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(obj);
        });

        return deferred.promise;
    }

    /** Helper method to convert query objects to SQL fragments **/
    public generateWhereStatement(criteria:Object = {}):string[]
    {
        var self = this;
        var whereStatement = [];

        for (var key in criteria)
        {
            var query = criteria[key];

            _.each(query, function(value:any){
                switch (Utils.getObjectType(value))
                {
                    case 'Object':
                        var operator = value['operator'];

                        if (operator && operator.toLowerCase() === 'lessthan')
                            whereStatement.push(key + ':[' + value['value'] + ' TO *] ');
                        else if(operator && operator.toLowerCase() === 'greaterthan')
                            whereStatement.push(key + ':[* TO ' + value['value'] + '] ');
                        break;

                    case 'Number':
                        whereStatement.push(key + ':' + value);
                        break;
                    case 'String':
                        var values = value.split(' ');//TODO configure solr to support whitespace and * search together
                        _.each(values, function(val){
                            whereStatement.push(key + ':*' + val + '* ');
                        })
                        break;
                }
            })
        }

        return whereStatement;
    }
}
export = SolrDao