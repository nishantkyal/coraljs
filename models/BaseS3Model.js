"use strict";
///<reference path='../_references.d.ts'/>
const AbstractModel = require("./AbstractModel");
class BaseS3Model extends AbstractModel {
    /* Getters */
    getFileName() { return this.file_name; }
    getBasePath() { throw new Error('getBasePath() not implemented'); }
    /* Setters */
    setFileName(val) { this.file_name = val; }
    getS3Key() {
        if (this.getBasePath() && this.getFileName())
            return this.getBasePath() + '/' + this.getFileName();
        return null;
    }
    setS3Key(val) {
        this.setFileName(val.substring(val.lastIndexOf('/') + 1));
    }
}
BaseS3Model.COL_FILE_NAME = 'file_name';
BaseS3Model.METADATA_FIELDS = [];
module.exports = BaseS3Model;
//# sourceMappingURL=BaseS3Model.js.map