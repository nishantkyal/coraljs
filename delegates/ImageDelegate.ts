///<reference path='../_references.d.ts'/>
import q                                            = require('q');
var fs = require('fs');
var http = require('http');
var gm = require('gm');
import ImageSize                                    = require('../enums/ImageSize');

class ImageDelegate
{
    imageMagick = gm.subClass({ imageMagick: true });

    resize(srcImagePath:string, outputPath:string, outputSize:ImageSize):q.Promise<any>
    {
        var deferred = q.defer();
        try
        {
            this.imageMagick(srcImagePath)
                .size(function doResize(err, size)
                {
                    if (err)
                        return deferred.reject(err);

                    if (size.width >= size.height && size.width > outputSize)
                        this.resize(outputSize);
                    else if (size.height > size.width && size.height > outputSize)
                        this.resize(null, outputSize);

                    this.write(outputPath, function (err)
                    {
                        if (err)
                            deferred.reject(err);
                        else
                            deferred.resolve(outputPath);
                    });
                });
        } catch (error)
        {
            deferred.reject(error);
        }

        return deferred.promise;
    }

    delete(srcImagePath:string):q.Promise<any>
    {
        var deferred = q.defer();

        fs.unlink(srcImagePath, function (err)
        {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(srcImagePath);
        });

        return deferred.promise;
    }

    move(oldPath:string, newPath:string):q.Promise<any>
    {
        var deferred = q.defer();

        this.resize(oldPath, newPath, ImageSize.SMALL);
        fs.rename(oldPath, newPath, function (err)
        {
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
        var request = http.get(imageUrl, function (response)
        {
            if (response)
            {
                response.pipe(file);
                file.on('finish', function ()
                {
                    file.close();
                });
                deferred.resolve('Image Fetched from ' + imageUrl);
            }
            else
                deferred.reject('Error ');
        });

        return deferred.promise;
    }
}
export = ImageDelegate