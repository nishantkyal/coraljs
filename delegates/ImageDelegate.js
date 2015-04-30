var q = require('q');
var fs = require('fs');
var http = require('http');
var ImageSize = require('../enums/ImageSize');
var gm = require('gm');
var ImageDelegate = (function () {
    function ImageDelegate() {
        this.imageMagick = gm.subClass({ imageMagick: true });
    }
    ImageDelegate.prototype.resize = function (srcImagePath, outputPath, outputSize) {
        var deferred = q.defer();
        try {
            this.imageMagick(srcImagePath).size(function doResize(err, size) {
                if (err)
                    return deferred.reject(err);
                if (size.width >= size.height && size.width > outputSize)
                    this.resize(outputSize);
                else if (size.height > size.width && size.height > outputSize)
                    this.resize(null, outputSize);
                this.write(outputPath, function (err) {
                    if (err)
                        deferred.reject(err);
                    else
                        deferred.resolve(outputPath);
                });
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    };
    ImageDelegate.prototype.delete = function (srcImagePath) {
        var deferred = q.defer();
        fs.unlink(srcImagePath, function (err) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(srcImagePath);
        });
        return deferred.promise;
    };
    ImageDelegate.prototype.move = function (oldPath, newPath) {
        var deferred = q.defer();
        this.resize(oldPath, newPath, 50 /* SMALL */);
        fs.rename(oldPath, newPath, function (err) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve('Moved ' + oldPath + ' to ' + newPath);
        });
        return deferred.promise;
    };
    ImageDelegate.prototype.fetch = function (imageUrl, tempPath) {
        var deferred = q.defer();
        var file = fs.createWriteStream(tempPath);
        var request = http.get(imageUrl, function (response) {
            if (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.end();
                });
                deferred.resolve('Image Fetched from ' + imageUrl);
            }
            else
                deferred.reject('Error ');
        });
        return deferred.promise;
    };
    return ImageDelegate;
})();
module.exports = ImageDelegate;
//# sourceMappingURL=ImageDelegate.js.map