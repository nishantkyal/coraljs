import fs                                           = require('fs');
import http                                         = require('http');
import ImageSize                                    = require('../enums/ImageSize');

var gm = require('gm');

class ImageDelegate {
    imageMagick = gm.subClass({imageMagick: true});

    resize(srcImagePath: string, outputPath: string, outputSize: ImageSize): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
            } catch (error) {
                reject(error);
            }

        });
    }

    delete(srcImagePath: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fs.unlink(srcImagePath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(srcImagePath);
            });
        });
    }

    move(oldPath: string, newPath: string): Promise<any> {
        var self = this;

        return new Promise<any>((resolve, reject) => {
            this.resize(oldPath, newPath, ImageSize.SMALL);
            fs.rename(oldPath, newPath, function (err) {
                if (err)
                    reject(err);
                else
                    resolve('Moved ' + oldPath + ' to ' + newPath);
            });
        });
    }

    fetch(imageUrl: string, tempPath: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
    }
}

export = ImageDelegate