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
    static scheduleExceptionById(scheduleExceptionId?:number):string { return this.get('/rest/scheduleException/:scheduleExceptionId(\\d+)', {scheduleExceptionId: scheduleExceptionId})}

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
    static phoneCallScheduling(callId?:number):string { return this.get('/rest/call/:callId(\\d+)/scheduling', {callId: callId}); }

    /* URL patterns for Scheduled Tasks */
    static scheduleTask():string { return this.get('/rest/scheduledTask')}

    /** URL patterns for phone numbers **/
    static userPhone():string { return this.get('/rest/phone-number'); }
    static userPhoneById(UserPhoneId?:number):string { return this.get('/rest/phone-number/:UserPhoneId', {UserPhoneId: UserPhoneId}); }

    /* URL patterns for transaction */
    static transaction():string { return this.get('/rest/transaction'); }
    static transactionById(transactionId?:number):string { return this.get('/rest/transaction/:transactionId(\\d+)', {transactionId: transactionId}); }
    static transactionItem(transactionId?:number):string { return this.get('/rest/transaction/:transactionId(\\d+)/item', {transactionId: transactionId}); }
    static transactionItemById(itemId?:number):string { return this.get('/rest/item/:itemId(\\d+)', {itemId: itemId}); }

    /* URL patterns for user profile */
    static userProfile():string { return this.get('/rest/user/profile'); }
    static userProfileById(profileId?:number):string { return this.get('/rest/user/profile/:profileId(\\d+)', {profileId: profileId}); }

    /* URL patterns for user education */
    static userEducation() { return this.get('/rest/user/education'); }
    static userEducationById(educationId?:number) { return this.get('/rest/user/education/:educationId(\\d+)', { educationId: educationId }); }

    /* URL patterns for user employment */
    static userEmployment() { return this.get('/rest/user/employment'); }
    static userEmploymentById(employmentId?:number) { return this.get('/rest/user/employment/:employmentId(\\d+)', { employmentId: employmentId }); }

    /* URL patterns for user pricing scheme */
    static pricingScheme() { return this.get('/rest/pricingScheme'); }
    static pricingSchemeById(pricingSchemeId?:number) { return this.get('/rest/pricingScheme/:pricingSchemeId(\\d+)', { pricingSchemeId: pricingSchemeId }); }

    /* URL patterns for user review */
    static review() { return this.get('/rest/review'); }
    static reviewById(reviewId?:number) { return this.get('/rest/review/:reviewId(\\d+)', { reviewId: reviewId }); }

    /* URL patterns for user skill */
    static userSkill() { return this.get('/rest/user/skill'); }
    static userSkillById(skillId?:number) { return this.get('/rest/user/skill/:skillId(\\d+)', { skillId: skillId }); }

    /* URL patterns for user expertise */
    static expertise() { return this.get('/rest/user/expertise'); }
    static expertiseById(expertiseId?:number) { return this.get('/rest/user/expertise/:expertiseId(\\d+)', { expertiseId: expertiseId }); }

    /* URL patterns for coupons */
    static coupon():string { return this.get('/rest/coupon'); }
    static couponById(id?:number):string { return this.get('/rest/coupon/:id(\\d+)', {id: id}); }
    static couponValidation():string { return this.get('/rest/coupon/validation'); }

    /* URL patterns for Exotel  */
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