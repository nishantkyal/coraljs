///<reference path='../_references.d.ts'/>
import AbstractModel                                        = require('./AbstractModel');
import Utils                                                = require('../common/Utils');

class BaseS3Model extends AbstractModel
{
    static COL_BASE_PATH                                    = 'base_path';
    static COL_FILE_NAME                                    = 'file_name';

    private base_path:string;
    private file_name:string;

    /* Getters */
    getBasePath()                                           { return this.base_path; }
    getFileName()                                           { return this.file_name; }

    /* Setters */
    setBasePath(val)                                        { this.base_path = val; }
    setFileName(val)                                        { this.file_name = val; }
}
export = BaseS3Model;