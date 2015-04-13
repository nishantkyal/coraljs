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
            {
                var metaSearch = _.omit(searchQuery.toJson(), [BaseS3Model.COL_BASE_PATH, BaseS3Model.COL_FILE_NAME]);
                deferred.resolve(_.map(_.where(data.Contents, metaSearch), function(object)
                {
                    return new self.modelClass(object);
                }));
            }
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

    update(criteria:number, newValues:any):q.Promise<any>;
    update(criteria:Object, newValues:any):q.Promise<any>;
    update(srcObject:any, newObject:any):q.Promise<any>
    {
        return null;
    }

    delete(object:number):q.Promise<any>;
    delete(object:Object):q.Promise<any>;
    delete(object:BaseS3Model):q.Promise<any>;
    delete(object:any):q.Promise<any>
    {
        var deferred = q.defer();

        this.s3.deleteObject({
            'Bucket': this.bucket,
            'Key': object.getS3Path()
        }, function (err:any, data:any)
        {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(data);
        });

        return deferred.promise;
    }


    create(data:any, transaction?:Object):q.Promise<any>
    {
        throw new Error('Create operation not supported on S3, use the s3UploadMiddleware');
        return null;
    }

    get(id:any, options?:IDaoFetchOptions, transaction?:Object):q.Promise<any>
    {
        throw new Error("Get by ID operation not supported on S3, can't be done");
        return null;
    }

    private copyFile(srcPath:string, destPath:string):q.Promise<any>
    {
        var deferred = q.defer();

        this.s3.copyObject({
            'Bucket': this.bucket,
            'CopySource': [this.bucket, srcPath].join('/'),
            'Key': destPath,
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

    private moveFile(srcPath:string, destPath:string):q.Promise<any>
    {
        var self = this;

        return self.copyFile(srcPath, destPath)
            .then(
            function fileCopied()
            {
                return self.delete(srcPath);
            });
    }
}
export = S3Dao;
