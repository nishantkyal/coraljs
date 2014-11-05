///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import _                                            = require('underscore');
import log4js                                       = require('log4js');
import solr_client                                  = require('solr-client');
import http                                         = require('http');
import IDao                                         = require('../dao/IDao');
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
        return null;
    }

    get(id:any, fields?:string[]):q.Promise<any>;
    get(id:number, fields?:string[]):q.Promise<any>;
    get(id:any, fields?:string[]):q.Promise<any>
    {
        var self = this;
        if (Utils.getObjectType(id) == 'Array' && id.length > 1)
            return this.search({id: id}, fields);
        else
        {
            if (Utils.getObjectType(id) == 'Array')
                id = id[0];

            return this.find({id: id}, fields)
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

    search(searchQuery?:Object, fields?:string[]):q.Promise<any>
    {
        var deferred = q.defer<any>();

        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(searchQuery);
        solrQuery.fl(fields);

        this.solrClient.search(solrQuery, function(err:Error, obj:Object)
        {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
                deferred.resolve(obj['response']['docs']);
        });

        return deferred.promise;
    }

    find(searchQuery:Object, fields?:string[]):q.Promise<any>
    {
        var deferred = q.defer<any>();

        var solrQuery = this.solrClient.createQuery();
        solrQuery.q(searchQuery);
        solrQuery.fl(fields);
        solrQuery.rows(1);

        this.solrClient.search(solrQuery, function(err:Error, obj:Object)
        {
            if (!Utils.isNullOrEmpty(err))
                deferred.reject(err);
            else
            {
                var docs = obj['response']['docs'];
                deferred.resolve(docs.length != 0 ? docs[0] : null);
            }
        });

        return deferred.promise;
    }

    update(criteria:number, newValues:Object):q.Promise<any>;
    update(criteria:Object, newValues:Object):q.Promise<any>;
    update(criteria:any, newValues:Object):q.Promise<any>
    {
        var deferred = q.defer<any>();

        var oldDocSolrQuery = this.solrClient.createQuery();
        oldDocSolrQuery.q(criteria);
        oldDocSolrQuery.fl(['id', '_version_']);

        this.find(oldDocSolrQuery)
            .then(
            function documentFetched(document)
            {
                newValues['_version_'] = document['_version'];
                this.solrClient.update(newValues, function(err:Error, obj:Object)
                {
                    if (!Utils.isNullOrEmpty(err))
                        deferred.reject(err);
                    else
                        deferred.resolve(obj);
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
}
export = SolrDao