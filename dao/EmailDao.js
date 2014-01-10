var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDao = require('./BaseDAO');
var BaseModel = require('../models/BaseModel');
var Email = require('../models/Email');

/**
* DAO class for Email queue
*/
var EmailDao = (function (_super) {
    __extends(EmailDao, _super);
    function EmailDao() {
        _super.apply(this, arguments);
    }
    EmailDao.prototype.getModel = function () {
        return Email;
    };
    return EmailDao;
})(BaseDao);

module.exports = EmailDao;

