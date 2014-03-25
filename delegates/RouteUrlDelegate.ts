import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');

/*
All page urls for
    Dashboard
    Call Flow
    Expert Registration
 */
class RouteUrlDelegate
{
    /* Expert Registration route Urls */
    static expertRegistrationIndexPage():string { return ApiUrlDelegate.get('/expert/registration'); }
    static expertRegistrationLoginPage():string { return ApiUrlDelegate.get('/expert/login'); }
    static expertRegistrationRegisterPage():string { return ApiUrlDelegate.get('/expert/register'); }
    static expertRegistrationLinkedInLogin():string { return ApiUrlDelegate.get('/expert/login/linkedin'); }
    static expertRegistrationLinkedInLoginCallback():string { return ApiUrlDelegate.get('/expert/login/linkedin/callback'); }
    static expertRegistrationAuthorizationPage():string { return ApiUrlDelegate.get('/expert/authorization'); }
    static expertRegistrationAuthorizationDecision():string { return ApiUrlDelegate.get('/expert/authorization/decision'); }
    static expertRegistrationMobileVerificationPage():string { return ApiUrlDelegate.get('/expert/registration/mobile/verification'); }
    static expertRegistrationProfilePage():string { return ApiUrlDelegate.get('/expert/registration/profile'); }
    static expertRegistrationCompletePage():string { return ApiUrlDelegate.get('/expert/registration/complete'); }
    static expertRegistrationAlreadyRegisteredPage():string { return ApiUrlDelegate.get('/expert/registration/done'); }


}
export = RouteUrlDelegate