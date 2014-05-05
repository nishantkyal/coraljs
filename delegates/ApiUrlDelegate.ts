///<reference path='../_references.d.ts'/>
import url                                      = require('url');
import Utils                                    = require('../common/Utils');
/*
 * Class to hold all API URLs
 * Used to keep API URLs consistent between SearchNTalk and Coral
 * Note: Not using a generator for fine grained control and prevent unexpected behaviour
 */
class ApiUrlDelegate
{
    /* URL patterns for expert API */
    static expert():string { return this.get('/rest/expert'); }
    static expertById(expertId?:number):string { return this.get('/rest/expert/:expertId(\\d+)', {expertId: expertId}); }
    static expertActivitySummary(expertId?:number):string { return this.get('/rest/expert/:expertId(\\d+)/activity/summary', {expertId: expertId}); }

    /* URL patterns for user API */
    static user():string { return this.get('/rest/user'); }
    static userAuthentication():string { return this.get('/rest/user/authentication'); }
    static userById(userId?:number):string { return this.get('/rest/user/:userId(\\d+)', {userId: userId}); }
    static userProfilePicture(userId?:number, baseUrl?:string):string { return this.get('/rest/user/:userId(\\d+)/picture', {userId: userId}, baseUrl); }

    /* URL patterns for OAuth provider */
    static decision():string { return this.get('/rest/oauth/decision'); }
    static token():string { return this.get('/rest/oauth/token'); }

    /* URL patterns for expert schedules */
    static schedule():string { return this.get('/rest/schedule')}
    static scheduleById(scheduleId?:number):string { return this.get('/rest/schedule/:scheduleId(\\d+)', {scheduleId: scheduleId})}

    /* URL patterns for expert schedule rules*/
    static scheduleRule():string { return this.get('/rest/scheduleRule')}
    static scheduleRuleById(scheduleRuleId?:number):string { return this.get('/rest/scheduleRule/:scheduleRuleId(\\d+)', {scheduleRuleId: scheduleRuleId})}

    /* URL patterns for expert schedule exceptions */
    static scheduleException():string { return this.get('/rest/scheduleException')}
    static scheduleExceptionById(scheduleExceptionId?:number):string { return this.get('/rest/scheduleException/:scheduleExceptionId(\\d+)', {scheduleExceptionId:scheduleExceptionId})}

    /* URL patterns for third party integration */
    static integration():string { return this.get('/rest/integration'); }
    static integrationById(integrationId?:number):string { return this.get('/rest/integration/:integrationId(\\d+)', {integrationId: integrationId}); }
    static integrationSecretReset(integrationId?:number):string { return this.get('/rest/integration/:integrationId(\\d+)/secret/reset', {integrationId: integrationId}); }

    /* URL patterns for members */
    static integrationMember(integrationId?:number):string { return this.get('/rest/integration/:integrationId(\\d+)/member', {integrationId: integrationId}); }
    static integrationMemberById(integrationId?:number, memberId?:number):string { return this.get('/rest/integration/:integrationId(\\d+)/member/:memberId(\\d+)', {integrationId: integrationId, memberId: memberId}); }

    /* URL patterns for payments */
    static payment():string { return this.get('/rest/payment'); }
    static paymentById(paymentId?:number):string { return this.get('/rest/payment/:paymentId(\\d+)', {paymentId: paymentId}); }

    /* URL patterns for payout details */
    static payoutDetail():string { return this.get('/rest/payout-detail'); }
    static payoutDetailById(payoutDetailId?:number):string { return this.get('/rest/payout-detail/:payoutDetailId(\\d+)', {payoutDetailId: payoutDetailId}); }

    /* URL patterns for phone calls */
    static phoneCall():string { return this.get('/rest/call'); }
    static phoneCallById(callId?:number):string { return this.get('/rest/call/:callId(\\d+)', {callId: callId}); }
    static phoneCallReschedule(callId?:number):string { return this.get('/rest/call/:callId(\\d+)/reschedule', {callId: callId}); }
    static phoneCallCancel(callId?:number):string { return this.get('/rest/call/:callId(\\d+)/cancel', {callId: callId}); }

    /** URL patterns for phone numbers **/
    static UserPhone():string { return this.get('/rest/phone-number'); }
    static UserPhoneById(UserPhoneId?:number):string { return this.get('/rest/phone-number/:UserPhoneId', {UserPhoneId: UserPhoneId}); }

    /* URL patterns for transaction */
    static transaction():string { return this.get('/rest/transaction'); }
    static transactionById(transactionId?:number):string { return this.get('/rest/transaction/:transactionId(\\d+)', {transactionId: transactionId}); }
    static transactionItem(transactionId?:number):string { return this.get('/rest/transaction/:transactionId(\\d+)/item', {transactionId: transactionId}); }
    static transactionItemById(itemId?:number):string { return this.get('/rest/item/:itemId(\\d+)', {itemId: itemId}); }

    /* URL patterns for email */
    static expertInviteEmail():string { return this.get('/rest/email/expert/invitation'); }

    /* URL patterns for user profile */
    static userProfile():string { return this.get('/rest/user/profile'); }
    static userProfileById(profileId?:number):string { return this.get('/rest/user/profile/:profileId(\\d+)', {profileId: profileId}); }
    static userProfileFromLinkedIn(profileId?:number):string { return this.get('/rest/user/profileFromLinkedIn/:profileId(\\d+)', {profileId: profileId}); }
    static userProfileFromLinkedInCallback():string { return this.get('/rest/user/profileFromLinkedInCallback'); }

    static userEducation() { return this.get('/rest/user/education'); }
    static userEducationById(educationId?:number) { return this.get('/rest/user/education/:educationId(\\d+)', { educationId:educationId }); }

    static userEmployment() { return this.get('/rest/user/employment'); }
    static userEmploymentById(employmentId?:number) { return this.get('/rest/user/employment/:employmentId(\\d+)', { employmentId:employmentId }); }

    static userSkill() { return this.get('/rest/user/skill'); }
    static userSkillById(skillId?:number) { return this.get('/rest/user/skill/:skillId(\\d+)', { skillId:skillId }); }

    /* URL patterns for coupons */
    static coupon():string { return this.get('/rest/coupon'); }
    static couponById(couponId?:number):string { return this.get('/rest/coupon/:couponId(\\d+)', {couponId: couponId}); }
    static couponValidation():string { return this.get('/rest/coupon/validation'); }

    /* URL patterns for Twilio */
    static twiml():string { return this.get('/rest/twiml'); }
    static twimlJoinConference():string { return this.get('/rest/twiml/call'); }
    static twimlCallExpert(callId?:number):string { return this.get('/rest/twiml/call/:callId(\\d+)/expert', {callId: callId}); }
    static twimlCall(callId?:number):string { return this.get('/rest/twiml/call/:callId(\\d+)', {callId: callId}); }

    static exotel():string { return this.get('/rest/exotel'); }
    static exotelAddExpert():string { return this.get('/rest/exotelAddExpert'); }

    /* URL patterns for temporary tokens (invite codes, password reset, mobile verification etc.) */
    static tempToken():string { return this.get('/rest/token'); }
    static mobileVerificationCode():string { return this.get('/rest/code/mobile/verification'); }
    static expertInvitationCode():string { return this.get('/rest/code/expert/invitation'); }
    static expertInvitationCodeResend():string { return this.get('/rest/code/expert/invitation/resend'); }
    static sendForgotPasswordCode():string { return this.get('/rest/code/password/forgot'); }
    static resetPassword():string { return this.get('/rest/code/password/reset'); }

    /* URL pattern for widgets */
    static widget():string { return this.get('/rest/widget')}
    static widgetById(widgetId?:number):string { return this.get('/rest/widget/:widgetId', {widgetId: widgetId})}
    static publicWidget(widgetId?:number):string { return this.get('/widget/:widgetId', {widgetId: widgetId})}

    /*
     * Helper method to generate URLs with values substituted for parameters (if supplied)
     * @param urlPattern
     * @param values
     * @returns {string}
     */
    static get(urlPattern:string, values?:Object, baseUrl?:string):string
    {
        if (values)
            for (var key in values)
                if (values[key] != null)
                {
                    var urlParamRegex:RegExp = new RegExp(':' + key);
                    var urlParamTypeRegex:RegExp = new RegExp('\\(([^\\(]*)\\)', 'i');
                    urlPattern = urlPattern
                        .replace(urlParamTypeRegex, '')
                        .replace(urlParamRegex, values[key]);
                }
        if (!Utils.isNullOrEmpty(baseUrl))
            urlPattern = url.resolve(baseUrl, urlPattern);

        return urlPattern;
    }
}
export = ApiUrlDelegate