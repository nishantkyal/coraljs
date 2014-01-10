

var ApiConstants = require('./ApiConstants');
var ApiUrlDelegate = require('../delegates/ApiUrlDelegate');
var UserDelegate = require('../delegates/UserDelegate');
var UserSettingDelegate = require('../delegates/UserSettingDelegate');
var UserOAuthDelegate = require('../delegates/UserOAuthDelegate');
var TransactionDelegate = require('../delegates/TransactionDelegate');
var AccessControl = require('../middleware/AccessControl');
var ValidateRequest = require('../middleware/ValidateRequest');
var UserOauth = require('../models/UserOauth');
var User = require('../models/User');
var IntegrationMember = require('../models/IntegrationMember');
var Utils = require('../Utils');

/**
Rest Calls for User
Allow only searchntalk.com
**/
var UserApi = (function () {
    function UserApi(app) {
        var userDelegate = new UserDelegate();
        var transactionDelegate = new TransactionDelegate();
        var userOauthDelegate = new UserOAuthDelegate();
        var userSettingDelegate = new UserSettingDelegate();

        /** Create user **/
        app.put(ApiUrlDelegate.user(), AccessControl.allowDashboard, function (req, res) {
            var user = req.body[ApiConstants.USER];

            if (!Utils.isNullOrEmpty(user.getEmail()) || !Utils.isNullOrEmpty(user.getMobile()))
                userDelegate.create(user).then(function userCreated(user) {
                    res.json(user);
                }, function userCreateError(err) {
                    res.status(500).json(err);
                });
else
                res.status(500).json('Invalid data');
        });

        /** Get user profile */
        app.get(ApiUrlDelegate.userProfile(), function (req, res) {
            // TODO: Vary fields according to logged in user's role
            // TODO: Support search
            var fields = req.query[ApiConstants.FIELDS];
            var userId = req.params[ApiConstants.USER_ID];

            userDelegate.get(userId, fields).then(function userFetched(user) {
                res.json(user);
            }, function userFetchError(err) {
                res.status(500).json(err);
            });
        });

        /** Authenticate user **/
        app.get(ApiUrlDelegate.userAuthentication(), AccessControl.allowDashboard, function (req, res) {
            var userName = req.body[ApiConstants.USER];
            var password = req.body[ApiConstants.PASSWORD];

            if (userName && password)
                userDelegate.authenticate(userName, password).then(function authComplete(user) {
                    res.json(user);
                }, function authError(err) {
                    res.status(401).json(err);
                });
else
                res.status(422).json('Username or password missing');
        });

        /** Update settings */
        app.post(ApiUrlDelegate.userById(), AccessControl.allowDashboard, function (req, res) {
            var userId = req.params[ApiConstants.USER_ID];
            var user = new User(req.body[ApiConstants.USER]);

            if (user.isValid())
                userDelegate.update(userId, user).then(function userUpdated(result) {
                    res.json(result);
                }, function updateFailed(err) {
                    res.status(500).json(err);
                });
else
                res.status(422).json('Invalid input');
        });

        /** Generate a password reset token for user **/
        app.get(ApiUrlDelegate.userPasswordResetToken(), AccessControl.allowDashboard, function (req, res) {
            var userId = req.params[ApiConstants.USER_ID];

            userSettingDelegate.createPasswordResetToken(userId).then(function passwordResetTokenGenerated(token) {
                res.json(token);
            }, function passwordResetTokenGenerateError(err) {
                res.status(500).json(err);
            });
        });

        /** Generate a email verification token for user **/
        app.get(ApiUrlDelegate.emailVerificationToken(), AccessControl.allowDashboard, function (req, res) {
            var userId = req.params[ApiConstants.USER_ID];

            userSettingDelegate.createEmailVerificationToken(userId).then(function emailVerificationTokenGenerated(token) {
                res.json(token);
            }, function emailVerificationTokenGenerateError(err) {
                res.status(500).json(err);
            });
        });

        /** Get account balance */
        app.get(ApiUrlDelegate.userTransactionBalance(), AccessControl.allowDashboard, function (req, res) {
            var userId = req.params[ApiConstants.USER_ID];

            transactionDelegate.getAccountBalance(userId).then(function accountBalanceFetched(total) {
                res.json(total);
            }, function accountBalanceError(err) {
                res.status(500).json(err);
            });
        });

        /**
        * Update OAuth token
        * @return updated user
        **/
        app.put(ApiUrlDelegate.userOAuthToken(), AccessControl.allowDashboard, function (req, res) {
            var userOauth = new UserOauth(req.body);

            if (userOauth.isValid())
                userOauthDelegate.addOrUpdateToken(userOauth).then(function tokenAdded(updatedUser) {
                    res.json(updatedUser);
                }, function tokenAddError(err) {
                    res.status(500).json(err);
                });
else
                res.status(500).json('Invalid input');
        });

        /** Delete OAuth token **/
        app.delete(ApiUrlDelegate.userOAuthToken(), AccessControl.allowDashboard, function (req, res) {
            var userId = req.params[ApiConstants.USER_ID];
            var type = req.params['type'];

            userOauthDelegate.deleteForUser(userId, type).then(function tokenRemoved(result) {
                res.json(result);
            }, function tokenRemoveError(err) {
                res.status(500).json(err);
            });
        });
    }
    return UserApi;
})();

module.exports = UserApi;

