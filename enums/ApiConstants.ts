/*
 * Constants used on query strings, headers of API calls
 */
class ApiConstants
{
    static FIELDS:string = 'fields';
    static FILTERS:string = 'filters';
    static INCLUDE:string = 'include';
    static ROLE:string = 'role';

    /* Param constants */
    static COUPON_ID:string = 'couponId';
    static USER_ID:string = 'userId';
    static USER_PROFILE_ID:string = 'profileId';
    static EXPERT_ID:string = 'expertId';
    static MEMBER_ID:string = 'memberId';
    static EDUCATION_ID:string = 'educationId';
    static EMPLOYMENT_ID:string = 'employmentId';
    static SKILL_ID:string = 'skillId';
    static INTEGRATION_ID:string = 'integrationId';
    static PROFILE_TYPE:string = 'profileType';
    static USERNAME:string = 'login';
    static PASSWORD:string = 'pass';
    static PHONE_NUMBER_ID:string = 'phoneNumberId';
    static PHONE_CALL_ID:string = 'callId';
    static SCHEDULE_ID:string = 'scheduleId';
    static SCHEDULE_RULE_ID:string = 'scheduleRuleId';
    static SCHEDULE_EXCEPTION_ID:string = 'scheduleExceptionId';
    static START_TIME:string = 'startTime';
    static END_TIME:string = 'endTime';
    static DURATION:string = 'duration';
    static TYPE:string = 'type';
    static CODE:string = 'code';
    static CODE_VERIFICATION:string = 'code_verification';

    /* Body constants */
    static COUPON:string = 'coupon';
    static USER:string = 'user';
    static USER_PROFILE:string = 'user';
    static USER_EDUCATION:string = 'education';
    static USER_EMPLOYMENT:string = 'employment';
    static USER_SKILL:string = 'skill';
    static OAUTH:string = 'oauth';
    static INTEGRATION:string = 'integration';
    static INTEGRATION_MEMBER:string = 'integration_member';
    static EXPERT:string = 'expert';
    static PHONE_NUMBER:string = 'phoneNumber';
    static PHONE_CALL:string = 'phoneCall';
    static SCHEDULE:string = 'expertSchedule';
    static SCHEDULE_RULE:string = 'expertScheduleRule';
    static SCHEDULE_EXCEPTION:string = 'expertScheduleException';
    static SMS:string = 'sms';
    static TRANSACTION:string = 'transaction';
}
export = ApiConstants