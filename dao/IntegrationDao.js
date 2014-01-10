var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var MysqlDelegate = require('../delegates/MysqlDelegate');
var BaseDAO = require('./BaseDAO');

/**
* DAO class for third party integrations
*/
var IntegrationDao = (function (_super) {
    __extends(IntegrationDao, _super);
    function IntegrationDao() {
        _super.apply(this, arguments);
    }
    IntegrationDao.getAll = function () {
        return MysqlDelegate.executeQuery('SELECT * FROM integration', null);
    };

    IntegrationDao.getTableName = function () {
        return 'integration';
    };
    IntegrationDao.getGeneratedIdName = function () {
        return 'integration_id';
    };
    return IntegrationDao;
})(BaseDAO);

module.exports = IntegrationDao;

