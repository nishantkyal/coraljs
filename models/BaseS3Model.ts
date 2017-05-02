///<reference path='../_references.d.ts'/>
import AbstractModel                                        = require('./AbstractModel');
import Utils                                                = require('../common/Utils');

class BaseS3Model extends AbstractModel
{
    static COL_FILE_NAME                                    = 'file_name';
    static METADATA_FIELDS:string[]                         = [];

    private file_name:string;

    /* Getters */
    getFileName()                                           { return this.file_name; }
    getBasePath()                                           { throw new Error('getBasePath() not implemented')}

    /* Setters */
    setFileName(val)                                        { this.file_name = val; }

    getS3Key():string
    {
        if (this.getBasePath() && this.getFileName())
            return this.getBasePath() + '/' + this.getFileName();
        return null;
    }

    setS3Key(val)
    {
        this.setFileName(val.substring(val.lastIndexOf('/') + 1));
    }
}
export = BaseS3Model;