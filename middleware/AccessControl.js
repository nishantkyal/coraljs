

var log4js = require('log4js');
var IntegrationMemberDelegate = require('../delegates/IntegrationMemberDelegate');
var IntegrationMemberRole = require('../enums/IntegrationMemberRole');
var Utils = require('../Utils');
var Config = require('../Config');

/**
* Middleware to access control Integration REST APIs
* Note: Website accesses delegates directly and doesn't go through the APIs hence no access control middleware for it
*/
var AccessControl = (function () {
    function AccessControl() {
    }
    AccessControl.allowOwner = function (req, res, next) {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId).then(function handleRoleFetched(integrationMember) {
            if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role === IntegrationMemberRole.OWNER)
                next();
else
                res.status(401).json('Unauthorized');
        }, function roleFetchError(error) {
            AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
            res.status(500).json("Couldn't authenticate request");
        });
    };

    AccessControl.allowAdmin = function (req, res, next) {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['memberId'];
        AccessControl.getIntegration(accessToken, integrationMemberId).then(function handleRoleFetched(integrationMember) {
            if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role >= IntegrationMemberRole.ADMIN)
                next();
else
                res.status(401).json('Unauthorized');
        }, function roleFetchError(error) {
            AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
            res.status(500).json("Couldn't authenticate request");
        });
    };

    AccessControl.allowExpert = function (req, res, next) {
        var accessToken = req.query['token'];
        var integrationMemberId = req.params['expertId'];
        AccessControl.getIntegration(accessToken, integrationMemberId).then(function handleRoleFetched(integrationMember) {
            if (integrationMember.integration_id === Config.get(Config.DASHBOARD_INTEGRATION_ID) || integrationMember.role === IntegrationMemberRole.EXPERT)
                next();
else
                res.status(401).json('Unauthorized');
        }, function roleFetchError(error) {
            AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
            res.status(500).json("Couldn't authenticate request");
        });
    };

    AccessControl.allowDashboard = function (req, res, next) {
        var remoteAddress = req.ip;
        var searchntalkHosts = Config.get('SearchNTalk.hosts');

        if (!searchntalkHosts && searchntalkHosts.length == 0)
            this.logger.error('NO SEARCHNTALK HOSTS CONFIGURED, DASHBOARD WONT AUTHENTICATE');

        if (searchntalkHosts.indexOf(remoteAddress) != -1)
            next();
else {
            AccessControl.logger.error('Auth failed for IP: ' + req.ip);
            res.status(500).json("Couldn't authenticate request");
        }
    };

    AccessControl.getIntegration = /* Helper method to get details of integration corresponding to token and member id */
    function (accessToken, integrationMemberId) {
        var search = { 'access_token': accessToken };
        if (integrationMemberId)
            search['integration_member_id'] = integrationMemberId;

        return new IntegrationMemberDelegate().findValidAccessToken(accessToken, integrationMemberId);
    };
    AccessControl.logger = log4js.getLogger(Utils.getClassName('AccessControl'));
    return AccessControl;
})();

module.exports = AccessControl;

