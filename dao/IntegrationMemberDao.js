var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseDAO = require('./BaseDAO');
var BaseModel = require('../models/BaseModel');
var IntegrationMember = require('../models/IntegrationMember');

var IntegrationMemberDao = (function (_super) {
    __extends(IntegrationMemberDao, _super);
    function IntegrationMemberDao() {
        _super.apply(this, arguments);
    }
    IntegrationMemberDao.getTableName = function () {
        return 'integration_member';
    };
    IntegrationMemberDao.getGeneratedIdName = function () {
        return 'integration_member_id';
    };
    IntegrationMemberDao.prototype.getModel = function () {
        return IntegrationMember;
    };
    return IntegrationMemberDao;
})(BaseDAO);

module.exports = IntegrationMemberDao;

//# sourceMappingURL=IntegrationMemberDao.js.map
