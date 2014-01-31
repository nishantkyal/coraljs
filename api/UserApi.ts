///<reference path='../_references.d.ts'/>
///<reference path='./ApiConstants.ts'/>;
///<reference path='../delegates/ApiUrlDelegate.ts'/>;
///<reference path='../delegates/UserDelegate.ts'/>;
///<reference path='../delegates/UserSettingDelegate.ts'/>;
///<reference path='../delegates/UserOAuthDelegate.ts'/>;
///<reference path='../delegates/TransactionDelegate.ts'/>;
///<reference path='../middleware/AccessControl.ts'/>;
///<reference path='../middleware/ValidateRequest.ts'/>;
///<reference path='../models/UserOauth.ts'/>;
///<reference path='../models/User.ts'/>;
///<reference path='../models/IntegrationMember.ts'/>;
///<reference path='../common/Utils.ts'/>;

/**
 Rest Calls for User
 Allow only searchntalk.com
 **/
module api
{
    export class UserApi
    {
        constructor(app)
        {
            var userDelegate = new delegates.UserDelegate();
            var userOauthDelegate = new delegates.UserOAuthDelegate();
            var userSettingDelegate = new delegates.UserSettingDelegate();

            /** Create user **/
            app.put(delegates.ApiUrlDelegate.user(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var user:models.User = req.body[api.ApiConstants.USER];

                if (!common.Utils.isNullOrEmpty(user.getEmail()) || !common.Utils.isNullOrEmpty(user.getMobile()))
                    userDelegate.create(user)
                        .then(
                        function userCreated(user:models.User) { res.json(user); },
                        function userCreateError(err) { res.status(500).json(err); }
                    );
                else
                    res.status(500).json('Invalid data');
            });

            /** Authenticate user **/
            app.get(delegates.ApiUrlDelegate.userAuthentication(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userName = req.body[api.ApiConstants.USERNAME];
                var password = req.body[api.ApiConstants.PASSWORD];

                if (userName && password)
                    userDelegate.authenticate(userName, password)
                        .then(
                        function authComplete(user) { res.json(user); },
                        function authError(err) { res.status(401).json(err); }
                    );
                else
                    res.status(422).json('Username or password missing');
            });

            /** Update settings */
            app.post(delegates.ApiUrlDelegate.userById(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userId:string = req.params[api.ApiConstants.USER_ID];
                var user:models.User = req.body[api.ApiConstants.USER];

                if (user.isValid())
                    userDelegate.update(userId, user)
                        .then(
                        function userUpdated(result) { res.json(result); },
                        function updateFailed(err) { res.status(500).json(err); }
                    )
                else
                    res.status(422).json('Invalid input');
            });

            /** Generate a password reset token for user **/
            app.get(delegates.ApiUrlDelegate.userPasswordResetToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userId = req.params[api.ApiConstants.USER_ID];

                userSettingDelegate.createPasswordResetToken(userId)
                    .then(
                    function passwordResetTokenGenerated(token) { res.json(token); },
                    function passwordResetTokenGenerateError(err) { res.status(500).json(err); }
                )
            });

            /* Generate a email verification token for user */
            app.get(delegates.ApiUrlDelegate.emailVerificationToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userId = req.params[api.ApiConstants.USER_ID];

                userSettingDelegate.createEmailVerificationToken(userId)
                    .then(
                    function emailVerificationTokenGenerated(token) { res.json(token); },
                    function emailVerificationTokenGenerateError(err) { res.status(500).json(err); }
                )
            });

            /* Get account balance */
            app.get(delegates.ApiUrlDelegate.userTransactionBalance(), middleware.AccessControl.allowDashboard, function (req, res)
            {
            });

            /* Generate mobile verification code */
            app.put(delegates.ApiUrlDelegate.mobileVerificationToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                userDelegate.createMobileVerificationToken()
                    .then(
                    function codeCreated(result) { res.send(result); },
                    function codeCreationFailed(error) { res.send(500); }
                )
            });

            /* Search mobile verification code */
            app.get(delegates.ApiUrlDelegate.mobileVerificationToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var code:string = req.body['code'];
                var ref:string = req.body['ref'];

                userDelegate.searchMobileVerificationToken(code, ref)
                    .then(
                    function codeCreated(result) { res.send(result); },
                    function codeCreationFailed(error) { res.send(500); }
                )
            });

            /* Update OAuth token */
            app.put(delegates.ApiUrlDelegate.userOAuthToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userOauth:models.UserOauth = req.body[api.ApiConstants.OAUTH];
                var user:models.User = req.body[api.ApiConstants.USER];

                if (userOauth.isValid())
                    userOauthDelegate.addOrUpdateToken(userOauth, user)
                        .then(
                        function tokenAdded(updatedUser:models.User) { res.json(updatedUser); },
                        function tokenAddError(err) { res.status(500).json(err); }
                    );
                else
                    res.status(500).json('Invalid input');
            });

            /** Delete OAuth token **/
            app.delete(delegates.ApiUrlDelegate.userOAuthToken(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var userId = req.params[api.ApiConstants.USER_ID];
                var type = req.params['type'];

                userOauthDelegate.deleteByUser(userId)
                    .then(
                    function tokenRemoved(result) { res.json(result); },
                    function tokenRemoveError(err) { res.status(500).json(err); }
                );
            });

        }
    }
}