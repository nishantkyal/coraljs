/**
 * Constants used on query strings, headers of API calls
 */
class ApiConstants {

    static FIELDS:string = 'fields';
    static FILTERS:string = 'filters';

    /* Param constants */
    static USER_ID:string = 'userId';
    static EXPERT_ID:string = 'expertId';
    static INTEGRATION_ID:string = 'integrationId';
    static PROFILE_TYPE:string = 'profileType';
    static PASSWORD:string = 'pass';
    static PHONE_NUMBER_ID:string = 'phoneNumberId';
    static SCHEDULE_ID:string = 'scheduleId';
    static SCHEDULE_RULE_ID:string = 'scheduleRuleId';

    /* Body constants */
    static USER:string = 'user';
    static INTEGRATION:string = 'integration';
    static EXPERT:string = 'expert';
    static PHONE_NUMBER:string = 'phoneNumber';
    static SCHEDULE:string = 'expertSchedule';
    static SCHEDULE_RULE:string = 'expertScheduleRule';

}
export = ApiConstants