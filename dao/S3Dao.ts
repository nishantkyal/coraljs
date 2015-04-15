///<reference path='../_references.d.ts'/>
import _                                                            = require('underscore');
import q                                                            = require('q');
import AWS                                                          = require('aws-sdk');
import IDao                                                         = require('./IDao');
import IDaoFetchOptions                                             = require('./IDaoFetchOptions');
import BaseS3Model                                                  = require('../models/BaseS3Model');
import Utils                                                        = require('../common/Utils');
var amazonS3 = require('awssum-amazon-s3');

class S3Dao implements IDao
{
    private s3:AWS.S3;
    private bucket:string;
    modelClass:typeof BaseS3Model;

    constructor(modelClass:typeof BaseS3Model, awsAccessKey:string, accessKeySecret:string, region:string, bucket:string)
    {
        this.modelClass = modelClass;
        this.bucket = bucket;
        this.s3 = new AWS.S3({
            accessKeyId: awsAccessKey,
            secretAccessKey: accessKeySecret,
            region: region
        });
    }

    search(searchQuery?:BaseS3Model):q.Promise<BaseS3Model[]>
    {
        var deferred = q.defer<BaseS3Model[]>();
        var self = this;

        this.s3.listObjects({
            'Bucket': this.bucket,
            'Prefix': searchQuery.getBasePath()
        }, function (err:any, data:any)
        {
            if (err)
                deferred.reject(err);
            else
                return q.all(_.map(data.Contents, function(object:any)
                {
                    return self.get(object.Key);
                }))
                    .then(
                    function metadataFetched(models:BaseS3Model[])
                    {
                        var metaSearch = _.pick(searchQuery.toJson(), self.modelClass.METADATA_FIELDS);
                        deferred.resolve(_.map(_.filter(models, function(object:BaseS3Model)
                        {
                            for (var key in metaSearch)
                            {
                                if (metaSearch[key] && (!object[key] || metaSearch[key].toString() != object[key].toString()))
                                    return false;
                            }

                            return true;
                        }), function(object)
                        {
                            // Add back the non metadata fields since object return from S3 won't have that
                            object = _.extend(object, _.omit(searchQuery, self.modelClass.METADATA_FIELDS));
                            return new self.modelClass(object);
                        }));
                    });
        });

        return deferred.promise;
    }

    find(searchQuery:BaseS3Model):q.Promise<any>
    {
        return this.search(searchQuery)
            .then(
            function searched(results:any[])
            {
                if (!Utils.isNullOrEmpty(results))
                    return results[0];
                return results;
            });
    }

    update(criteria:BaseS3Model, newValues:BaseS3Model):q.Promise<any>;
    update(criteria:Object, newValues:Object):q.Promise<any>;
    update(criteria:any, newValues:any):q.Promise<any>
    {
        var self = this;

        return this.search(criteria)
            .then(
            function searched(results:BaseS3Model[])
            {
                return q.all(_.map(results, function(result:BaseS3Model)
                {
                    return self.moveFile(result, _.extend(result.toJson(), newValues));
                }));
            });
    }

    delete(object:Object):q.Promise<any>;
    delete(object:BaseS3Model):q.Promise<any>;
    delete(object:any):q.Promise<any>
    {
        var self = this;

        return this.search(object)
            .then(
            function searched(objects:BaseS3Model[])
            {
                if (Utils.isNullOrEmpty(objects))
                    throw new Error('No such files found');

                return q.all(_.map(objects, function(object:BaseS3Model)
                {
                    return self.deleteFile(object.getS3Key());
                }));
            });
    }


    create(data:any, transaction?:Object):q.Promise<any>
    {
        throw new Error('Operation not supported');
        return null;
    }

    get(id:any, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        var deferred = q.defer();
        var self = this;

        this.s3.headObject({
            'Bucket': this.bucket,
            'Key': id
        }, function (err:any, data:any)
        {
            if (err)
                deferred.reject(err);
            else
            {
                var model = new self.modelClass(data.Metadata);
                model.setS3Key(id);
                deferred.resolve(model);
            }
        });

        return deferred.promise;
    }

    /* Helper methods for S3 file operations */
    private copyFile(src:BaseS3Model, dest:BaseS3Model):q.Promise<any>
    {
        var deferred = q.defer();

        this.s3.copyObject({
            'Bucket': this.bucket,
            'CopySource': src.getS3Key(),
            'Key': dest.getS3Key(),
            'Metadata': _.omit(dest.toJson(), [BaseS3Model.COL_FILE_NAME]),
            'ACL': 'public-read'
        }, function (err:any, data:any)
        {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(data);
        });

        return deferred.promise;
    }

    private deleteFile(path:string):q.Promise<any>
    {
        var deferred = q.defer();

        this.s3.deleteObject({
            'Bucket': this.bucket,
            'Key': path
        }, function (err:any, data:any)
        {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(data);
        });

        return deferred.promise;
    }

    private moveFile(src:BaseS3Model, dest:BaseS3Model):q.Promise<any>
    {
        var self = this;

        return self.copyFile(src, dest)
            .then(
            function fileCopied()
            {
                return self.deleteFile(src.getS3Key());
            });
    }
}
export = S3Dao;
