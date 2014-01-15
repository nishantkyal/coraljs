/**
 * Class to hold all API URLs
 * Used to keep API URLs consistent between SearchNTalk and Coral
 * Note: Not using a generator for fine grained control and prevent unexpected behaviour
 */
class ApiUrlDelegate {

    /* URL patterns for expert API */
    static expert():string { return this.get('/rest/expert'); }
    static expertById(expertId?:string):string { return this.get('/rest/expert/:expertId', {expertId: expertId}); }
    static expertActivitySummary(expertId?:string):string { return this.get('/rest/expert/:expertId/activity/summary', {expertId: expertId}); }

    /* URL patterns for user API */
    static user():string { return this.get('/rest/user'); }
    static userAuthentication():string { return this.get('/rest/user/authentication'); }
    static userById(userId?:string):string { return this.get('/rest/user/:userId', {userId: userId}); }
    static userPasswordResetToken(userId?:string):string { return this.get('/rest/user/:userId/passwordResetToken', {userId: userId}); }
    static emailVerificationToken(userId?:string):string { return this.get('/rest/user/:userId/emailVerification', {userId: userId}); }
    static userProfile(userId?:string):string { return this.get('/rest/user/:userId/profile', {userId: userId}); }
    static userIntegrationDetails(userId?:string, integrationId?:string):string { return this.get('/rest/user/:userId/integration/:integrationId', {userId: userId, integrationId: integrationId}); }
    static userActivitySummary(userId?:string):string { return this.get('/rest/user/:userId/activity/summary', {userId: userId}); }
    static userTransactionBalance(userId?:string):string { return this.get('/rest/user/:userId/transactions/balance', {userId: userId}); }

    /* URL patterns for user oauth (FB, LinkedIn ..) */
    static userOAuth():string { return this.get('/rest/user/oauth'); }
    static userOAuthToken(userId?:string, type?:string):string { return this.get('/rest/user/:userId/oauth/:type/token', {userId: userId, type: type}); }

    /** URL patterns for OAuth provider **/
    static decision():string { return this.get('/rest/oauth/decision'); }
    static token():string { return this.get('/rest/oauth/token'); }

    /* URL patterns for expert schedules */
    static schedule():string { return this.get('/rest/schedule')}
    static scheduleById(scheduleId?:string):string { return this.get('/rest/schedule/:scheduleId')}
    static scheduleByExpert(expertId?:string):string { return this.get('/rest/expert/:expertId/schedule')}

    /* URL patterns for expert schedule rules*/
    static scheduleRule():string { return this.get('/rest/scheduleRule')}
    static scheduleRuleById(scheduleRuleId?:string):string { return this.get('/rest/scheduleRule/:scheduleRuleId')}
    static scheduleRuleByExpert(expertId?:string):string { return this.get('/rest/expert/:expertId/scheduleRule')}

    /* URL patterns for third party integration */
    static integration():string { return this.get('/rest/integration'); }
    static integrationById(integrationId?:string):string { return this.get('/rest/integration/:integrationId'); }
    static integrationSecretReset(integrationId?:string):string { return this.get('/rest/integration/:integrationId/secret/reset'); }
    static integrationMember(integrationId?:string):string { return this.get('/rest/integration/:integrationId/member'); }
    static integrationMemberById(integrationId?:string, memberId?:string):string { return this.get('/rest/integration/:integrationId/member/:memberId'); }
    static ownerActivitySummary(integrationId?:string, memberId?:string):string { return this.get('/rest/integration/:integrationId/activity/summary'); }

    /** URL patterns for payments **/
    static payment():string { return this.get('/rest/payment'); }
    static paymentById(paymentId?:string):string { return this.get('/rest/payment/:paymentId'); }

    /** URL patterns for payout details **/
    static payoutDetail():string { return this.get('/rest/payout-detail'); }
    static payoutDetailById(payoutDetailId?:string):string { return this.get('/rest/payout-detail/:payoutDetailId'); }

    /** URL patterns for phone calls **/
    static phoneCall():string { return this.get('/rest/call'); }
    static phoneCallById(callId?:string):string { return this.get('/rest/call/:callId'); }
    static phoneCallReschedule(callId?:string):string { return this.get('/rest/call/:callId/reschedule'); }
    static phoneCallCancel(callId?:string):string { return this.get('/rest/call/:callId/cancel'); }

    /** URL patterns for phone numbers **/
    static phoneNumber():string { return this.get('/rest/phone-number'); }
    static phoneNumberById(phoneNumberId?:string):string { return this.get('/rest/phone-number/:phoneNumberId'); }

    /** URL patterns for transaction **/
    static transaction():string { return this.get('/rest/transaction'); }
    static transactionById(transactionId?:string):string { return this.get('/rest/transaction/:transactionId'); }
    static transactionItem():string { return this.get('/rest/transaction/:transactionId/item'); }
    static transactionItemById(transactionId?:string, itemId?:string):string { return this.get('/rest/transaction/:transactionId/item/:itemId'); }

    /**
     * Helper method to generate URLs with values substituted for parameters (if supplied)
     * @param urlPattern
     * @param values
     * @returns {string}
     */
    private static get(urlPattern:string, values?:Object):string {
        if (values)
            for (var key in values)
                if (values[key] != null)
                    urlPattern = urlPattern.replace(new RegExp(':' + key), values[key])
        return urlPattern
    }
}
export = ApiUrlDelegate