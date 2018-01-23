"use strict";
const fs = require("fs");
const http = require("http");
const ImageSize = require("../enums/ImageSize");
var gm = require('gm');
class ImageDelegate {
    constructor() {
        this.imageMagick = gm.subClass({ imageMagick: true });
    }
    resize(srcImagePath, outputPath, outputSize) {
        return new Promise((resolve, reject) => {
            try {
                this.imageMagick(srcImagePath)
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
    }
    delete(srcImagePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(srcImagePath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(srcImagePath);
            });
        });
    }
    move(oldPath, newPath) {
        var self = this;
        return new Promise((resolve, reject) => {
            this.resize(oldPath, newPath, ImageSize.SMALL);
            fs.rename(oldPath, newPath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Moved ' + oldPath + ' to ' + newPath);
            });
        });
    }
    fetch(imageUrl, tempPath) {
        return new Promise((resolve, reject) => {
            var file = fs.createWriteStream(tempPath);
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
    }
}
module.exports = ImageDelegate;
//# sourceMappingURL=ImageDelegate.js.map