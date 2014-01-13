var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var _ = require('underscore');
var BaseDaoDelegate = require('BaseDaoDelegate');
var Utils = require('../Utils');
var MysqlDelegate = require('../delegates/MysqlDelegate');
var IntegrationDelegate = require('../delegates/IntegrationDelegate');

var IntegrationMemberDAO = require('../dao/IntegrationMemberDao');
var IntegrationMemberRole = require('../enums/IntegrationMemberRole');
var IntegrationMember = require('../models/IntegrationMember');
var AccessTokenCache = require('../caches/AccessTokenCache');

var IntegrationMemberDelegate = (function (_super) {
    __extends(IntegrationMemberDelegate, _super);
    function IntegrationMemberDelegate() {
        _super.apply(this, arguments);
    }
    IntegrationMemberDelegate.prototype.create = function (object, transaction) {
        var integrationMember = new IntegrationMember(object);
        integrationMember.setAuthCode(Utils.getRandomString(30));

        return _super.prototype.create.call(this, integrationMember, transaction);
    };

    IntegrationMemberDelegate.prototype.get = function (id, fields) {
        fields = fields || ['integration_member_id', 'role', 'integration_id', 'first_name', 'last_name'];
        return _super.prototype.get.call(this, id, fields);
    };

    IntegrationMemberDelegate.prototype.getIntegrationsForUser = function (user_id, fields) {
        var integrationFields = _.map(fields, function appendTableName(field) {
            return 'integration.' + field;
        });

        var query = 'SELECT ? ' + 'FROM integration, integration_member ' + 'WHERE integration_member.user_id = ? ' + 'AND integration.id = integration_member.integration_id';
        return MysqlDelegate.executeQuery(query, [integrationFields.join(','), user_id]);
    };

    IntegrationMemberDelegate.prototype.findValidAccessToken = function (accessToken, integrationMemberId) {
        var accessTokenCache = new AccessTokenCache();
        var that = this;

        function tokenFetched(result) {
            if (_.isArray(result))
                result = result[0];

            if (result && (!integrationMemberId || result['integration_member_id'] === integrationMemberId))
                return new IntegrationMember(result);
else
                return null;
        }

        return accessTokenCache.getAccessTokenDetails(accessToken).then(tokenFetched, function tokenFromCacheError(error) {
            // Try fetching from database
            that.logger.debug("Couldn't get token details from cache, hitting db, Error: " + error);
            return that.search({ 'access_token': accessToken }, []).then(tokenFetched);
        });
    };

    IntegrationMemberDelegate.prototype.updateById = function (id, integrationMember) {
        return this.update({ 'integration_member_id': id }, integrationMember);
    };

    IntegrationMemberDelegate.prototype.getDao = function () {
        return new IntegrationMemberDAO();
    };
    return IntegrationMemberDelegate;
})(BaseDaoDelegate);

module.exports = IntegrationMemberDelegate;

//# sourceMappingURL=IntegrationMemberDelegate.js.map
