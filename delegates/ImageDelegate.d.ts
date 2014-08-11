/// <reference path="../../SearchNTalk/_references.d.ts" />
import q = require('q');
import ImageSize = require('../enums/ImageSize');
declare class ImageDelegate {
    public imageMagick: any;
    public resize(srcImagePath: string, outputPath: string, outputSize: ImageSize): q.Promise<any>;
    public delete(srcImagePath: string): q.Promise<any>;
    public move(oldPath: string, newPath: string): q.Promise<any>;
    public fetch(imageUrl: string, tempPath: string): q.Promise<any>;
}
export = ImageDelegate;
