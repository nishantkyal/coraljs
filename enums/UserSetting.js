var UserSetting;
(function (UserSetting) {
    UserSetting[UserSetting["PASSWORD_RESET_TOKEN"] = 0] = "PASSWORD_RESET_TOKEN";
    UserSetting[UserSetting["PASSWORD_RESET_TOKEN_EXPIRY"] = 1] = "PASSWORD_RESET_TOKEN_EXPIRY";
    UserSetting[UserSetting["EMAIL_VERIFICATION_TOKEN"] = 2] = "EMAIL_VERIFICATION_TOKEN";
    UserSetting[UserSetting["EMAIL_VERIFICATION_TOKEN_EXPIRY"] = 3] = "EMAIL_VERIFICATION_TOKEN_EXPIRY";
})(UserSetting || (UserSetting = {}));

module.exports = UserSetting;

