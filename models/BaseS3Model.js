var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../_references.d.ts'/>
var AbstractModel = require('./AbstractModel');
var BaseS3Model = (function (_super) {
    __extends(BaseS3Model, _super);
    function BaseS3Model() {
        _super.apply(this, arguments);
    }
    /* Getters */
    BaseS3Model.prototype.getFileName = function () {
        return this.file_name;
    };
    BaseS3Model.prototype.getBasePath = function () {
        throw new Error('getBasePath() not implemented');
    };
    /* Setters */
    BaseS3Model.prototype.setFileName = function (val) {
        this.file_name = val;
    };
    BaseS3Model.prototype.getS3Key = function () {
        if (this.getBasePath() && this.getFileName())
            return this.getBasePath() + '/' + this.getFileName();
        return null;
    };
    BaseS3Model.prototype.setS3Key = function (val) {
        this.setFileName(val.substring(val.lastIndexOf('/') + 1));
    };
    BaseS3Model.COL_FILE_NAME = 'file_name';
    BaseS3Model.METADATA_FIELDS = [];
    return BaseS3Model;
})(AbstractModel);
module.exports = BaseS3Model;
//# sourceMappingURL=BaseS3Model.js.map