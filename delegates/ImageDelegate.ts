///<reference path='../_references.d.ts'/>
import q                                            = require('q');
var fs                                              = require('fs');
var http                                            = require('http');
var gm                                              = require('gm');
import ImageSize                                    = require('../enums/ImageSize');

class ImageDelegate
{
    imageMagick = gm.subClass({ imageMagick: true });

    resize(srcImagePath:string, outputPath:string, outputSize:ImageSize):q.Promise<any>
    {
        var deferred = q.defer();
        try {
            this.imageMagick(srcImagePath)
                .size(function doResize(err, size)
                {
                    if (err)
                        return deferred.reject(err);

                    var longerDim = Math.max(size.width, size.height);
                    var scale = outputSize/longerDim;
                    //this.resize(outputSize);
                    this.write(outputPath, function (err)
                    {
                        if (err)
                            deferred.reject(err);
                        else
                            deferred.resolve(outputPath);
                    });
                });
        } catch (error) {
            deferred.reject(error);
        }

        return deferred.promise;
    }

    move(oldPath:string, newPath:string):q.Promise<any>
    {
        var deferred = q.defer();

        fs.rename(oldPath, newPath, function(err) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve('Moved ' + oldPath + ' to ' + newPath);
        });

        return deferred.promise;
    }

    fetch(imageUrl:string, tempPath:string):q.Promise<any>
    {
        var deferred = q.defer();
        var file = fs.createWriteStream(tempPath);
        // TODO: Use request instead of http
        var request = http.get(imageUrl, function(response) {
            if(response)
            {
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                });
                deferred.resolve('Image Fetched from '+ imageUrl);
            }
            else
                deferred.reject('Error ');
        });

        return deferred.promise;
    }
}
export = ImageDelegate