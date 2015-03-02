///<reference path='../_references.d.ts'/>
import AbstractModel                                        = require('./AbstractModel');
import Utils                                                = require('../common/Utils');

class BaseS3Model extends AbstractModel
{
    getS3Path():string
    {
        this.logger.error('getS3Path not implemented');
        throw new Error('getS3Path not implemented for model ' + Utils.getClassName(this));
        return null;
    }
}
export = BaseS3Model;