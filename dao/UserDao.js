var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('../dao/BaseDAO');

/**
DAO for User
No business logic goes here, only data access layer
**/
var UserDao = (function (_super) {
    __extends(UserDao, _super);
    function UserDao() {
        _super.apply(this, arguments);
    }
    UserDao.getTableName = function () {
        return 'user';
    };
    UserDao.getGeneratedIdName = function () {
        return 'user_id';
    };
    return UserDao;
})(BaseDAO);

module.exports = UserDao;

//# sourceMappingURL=UserDao.js.map
