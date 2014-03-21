///<reference path='../_references.d.ts'/>
import q                                            = require('q');
import fs                                           = require('fs');
var gm = require('gm');
import ImageSize                                    = require('../enums/ImageSize');
class ImageDelegate
{
    resize(srcImagePath:string, outputPath:string, outputSize:ImageSize):q.Promise<any>
    {
        var deferred = q.defer();

        var readStream = fs.createReadStream(srcImagePath);
        gm(readStream, srcImagePath)
            .size({bufferStream: true}, function doResize(err, size)
            {
                if (err)
                    return deferred.reject(err);

                var longerDim = Math.max(size.width, size.height);
                this.resize(size.width * longerDim / outputSize, size.height * longerDim / outputSize)
                this.write(outputPath, function (err)
                {
                    if (err)
                        deferred.reject(err);
                    else
                        deferred.resolve(outputPath);
                });
            });

        return deferred.promise;
    }
}
export = ImageDelegate