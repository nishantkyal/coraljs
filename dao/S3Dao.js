///<reference path='../_references.d.ts'/>
var _ = require('underscore');
var q = require('q');
var AWS = require('aws-sdk');
var BaseS3Model = require('../models/BaseS3Model');
var Utils = require('../common/Utils');
var amazonS3 = require('awssum-amazon-s3');
var S3Dao = (function () {
    function S3Dao(modelClass, awsAccessKey, accessKeySecret, region, bucket) {
        this.modelClass = modelClass;
        this.bucket = bucket;
        this.s3 = new AWS.S3({
            accessKeyId: awsAccessKey,
            secretAccessKey: accessKeySecret,
            region: region
        });
    }
    S3Dao.prototype.search = function (searchQuery) {
        var deferred = q.defer();
        var self = this;
        this.s3.listObjects({
            'Bucket': this.bucket,
            'Prefix': searchQuery.getBasePath()
        }, function (err, data) {
            if (err)
                deferred.reject(err);
            else
                return q.all(_.map(data.Contents, function (object) {
                    return self.get(object.Key);
                })).then(function metadataFetched(models) {
                    var metaSearch = _.pick(searchQuery.toJson(), self.modelClass.METADATA_FIELDS);
                    deferred.resolve(_.map(_.filter(models, function (object) {
                        for (var key in metaSearch) {
                            if (metaSearch[key] && (!object[key] || metaSearch[key].toString() != object[key].toString()))
                                return false;
                        }
                        return true;
                    }), function (object) {
                        // Add back the non metadata fields since object return from S3 won't have that
                        object = _.extend(object, _.omit(searchQuery, self.modelClass.METADATA_FIELDS));
                        return new self.modelClass(object);
                    }));
                });
        });
        return deferred.promise;
    };
    S3Dao.prototype.find = function (searchQuery) {
        return this.search(searchQuery).then(function searched(results) {
            if (!Utils.isNullOrEmpty(results))
                return results[0];
            return results;
        });
    };
    S3Dao.prototype.update = function (criteria, newValues) {
        var self = this;
        return this.search(criteria).then(function searched(results) {
            return q.all(_.map(results, function (result) {
                return self.moveFile(result, _.extend(result.toJson(), newValues));
            }));
        });
    };
    S3Dao.prototype.delete = function (object) {
        var self = this;
        return this.search(object).then(function searched(objects) {
            if (Utils.isNullOrEmpty(objects))
                throw new Error('No such files found');
            return q.all(_.map(objects, function (object) {
                return self.deleteFile(object.getS3Key());
            }));
        });
    };
    S3Dao.prototype.create = function (data, transaction) {
        throw new Error('Operation not supported');
        return null;
    };
    S3Dao.prototype.get = function (id, options, transaction) {
        var deferred = q.defer();
        var self = this;
        this.s3.headObject({
            'Bucket': this.bucket,
            'Key': id
        }, function (err, data) {
            if (err)
                deferred.reject(err);
            else {
                var model = new self.modelClass(data.Metadata);
                model.setS3Key(id);
                deferred.resolve(model);
            }
        });
        return deferred.promise;
    };
    /* Helper methods for S3 file operations */
    S3Dao.prototype.copyFile = function (src, dest) {
        var deferred = q.defer();
        this.s3.copyObject({
            'Bucket': this.bucket,
            'CopySource': src.getS3Key(),
            'Key': dest.getS3Key(),
            'Metadata': _.omit(dest.toJson(), [BaseS3Model.COL_FILE_NAME]),
            'ACL': 'public-read'
        }, function (err, data) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(data);
        });
        return deferred.promise;
    };
    S3Dao.prototype.deleteFile = function (path) {
        var deferred = q.defer();
        this.s3.deleteObject({
            'Bucket': this.bucket,
            'Key': path
        }, function (err, data) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(data);
        });
        return deferred.promise;
    };
    S3Dao.prototype.moveFile = function (src, dest) {
        var self = this;
        return self.copyFile(src, dest).then(function fileCopied() {
            return self.deleteFile(src.getS3Key());
        });
    };
    return S3Dao;
})();
module.exports = S3Dao;
//# sourceMappingURL=S3Dao.js.map