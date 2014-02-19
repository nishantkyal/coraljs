/**
 * Constants used on query strings, headers of API calls
 */
class ApiConstants
{
    static FIELDS:string = 'fields';
    static FILTERS:string = 'filters';
    static INCLUDE:string = 'include';
    static ROLE:string = 'role';

    /* Param constants */
    static USER_ID:string = 'userId';
    static EXPERT_ID:string = 'expertId';
    static INTEGRATION_ID:string = 'integrationId';
    static PROFILE_TYPE:string = 'profileType';
    static USERNAME:string = 'login';
    static PASSWORD:string = 'pass';
    static PHONE_NUMBER_ID:string = 'phoneNumberId';
    static PHONE_CALL_ID:string = 'callId';
    static SCHEDULE_ID:string = 'scheduleId';
    static SCHEDULE_RULE_ID:string = 'scheduleRuleId';
    static START_TIME:string = 'startTime';
    static END_TIME:string = 'endTime';
    static DURATION:string = 'duration';

    /* Body constants */
    static USER:string = 'user';
    static OAUTH:string = 'oauth';
    static INTEGRATION:string = 'integration';
    static INTEGRATION_MEMBER:string = 'integration_member';
    static EXPERT:string = 'expert';
    static PHONE_NUMBER:string = 'phoneNumber';
    static PHONE_CALL:string = 'phoneCall';
    static SCHEDULE:string = 'expertSchedule';
    static SCHEDULE_RULE:string = 'expertScheduleRule';
    static SMS:string = 'sms';
}
export = ApiConstants