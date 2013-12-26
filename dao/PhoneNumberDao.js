var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var BaseDao = require('./BaseDAO');

var PhoneNumberDao = (function (_super) {
    __extends(PhoneNumberDao, _super);
    function PhoneNumberDao() {
        _super.apply(this, arguments);
    }
    return PhoneNumberDao;
})(BaseDao);

module.exports = BaseDao;

//# sourceMappingURL=PhoneNumberDao.js.map
