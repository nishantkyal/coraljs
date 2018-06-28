"use strict";
var fs = require("fs");
var http = require("http");
var ImageSize = require("../enums/ImageSize");
var gm = require('gm');
var ImageDelegate = (function () {
    function ImageDelegate() {
        this.imageMagick = gm.subClass({ imageMagick: true });
    }
    ImageDelegate.prototype.resize = function (srcImagePath, outputPath, outputSize) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.imageMagick(srcImagePath)
                    .size(function doResize(err, size) {
                    if (err)
                        reject(err);
                    if (size.width >= size.height && size.width > outputSize)
                        this.resize(outputSize);
                    else if (size.height > size.width && size.height > outputSize)
                        this.resize(null, outputSize);
                    this.write(outputPath, function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve(outputPath);
                    });
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
    ImageDelegate.prototype.delete = function (srcImagePath) {
        return new Promise(function (resolve, reject) {
            fs.unlink(srcImagePath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(srcImagePath);
            });
        });
    };
    ImageDelegate.prototype.move = function (oldPath, newPath) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) {
            _this.resize(oldPath, newPath, ImageSize.SMALL);
            fs.rename(oldPath, newPath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Moved ' + oldPath + ' to ' + newPath);
            });
        });
    };
    ImageDelegate.prototype.fetch = function (imageUrl, tempPath) {
        return new Promise(function (resolve, reject) {
            var file = fs.createWriteStream(tempPath);
            // TODO: Use request instead of http
            var request = http.get(imageUrl, function (response) {
                if (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.end();
                    });
                    resolve('Image Fetched from ' + imageUrl);
                }
                else
                    reject('Error ');
            });
        });
    };
    return ImageDelegate;
}());
module.exports = ImageDelegate;
//# sourceMappingURL=ImageDelegate.js.map