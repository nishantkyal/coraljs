enum UserStatus
{
    ACTIVE = 1,
    VERIFIED = 2,
    EMAIL_NOT_VERIFIED = -1,
    MOBILE_NOT_VERIFIED = -2,
    PROFILE_NOT_PUBLISHED = -3,
    HIDDEN_BY_USER = -4
}
export = UserStatus