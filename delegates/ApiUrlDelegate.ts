/**
 * Class to hold all API URLs
 * Used to keep API URLs consistent between SearchNTalk and Coral
 * Note: Not using a generator for fine grained control and prevent unexpected behaviour
 */
module delegates
{
    export class ApiUrlDelegate
    {
        /* URL patterns for expert API */
        static expert():string { return this.get('/rest/expert'); }
        static expertById(expertId?:number):string { return this.get('/rest/expert/:expertId', {expertId: expertId}); }
        static expertActivitySummary(expertId?:number):string { return this.get('/rest/expert/:expertId/activity/summary', {expertId: expertId}); }

        /* URL patterns for user API */
        static user():string { return this.get('/rest/user'); }
        static userAuthentication():string { return this.get('/rest/user/authentication'); }
        static userById(userId?:number):string { return this.get('/rest/user/:userId', {userId: userId}); }
        static userPasswordResetToken(userId?:number):string { return this.get('/rest/user/:userId/passwordResetToken', {userId: userId}); }
        static emailVerificationToken(userId?:number):string { return this.get('/rest/user/:userId/emailVerification', {userId: userId}); }
        static mobileVerificationToken():string { return this.get('/rest/mobile/verification'); }
        static userIntegrationDetails(userId?:number, integrationId?:number):string { return this.get('/rest/user/:userId/integration/:integrationId', {userId: userId, integrationId: integrationId}); }
        static userActivitySummary(userId?:number):string { return this.get('/rest/user/:userId/activity/summary', {userId: userId}); }
        static userTransactionBalance(userId?:number):string { return this.get('/rest/user/:userId/transactions/balance', {userId: userId}); }

        /* URL patterns for user oauth (FB, LinkedIn ..) */
        static userOAuth():string { return this.get('/rest/user/oauth'); }
        static userOAuthToken(userId?:number, type?:string):string { return this.get('/rest/user/:userId/oauth/:type/token', {userId: userId, type: type}); }

        /** URL patterns for OAuth provider **/
        static decision():string { return this.get('/rest/oauth/decision'); }
        static token():string { return this.get('/rest/oauth/token'); }

        /* URL patterns for expert schedules */
        static schedule():string { return this.get('/rest/schedule')}
        static scheduleById(scheduleId?:number):string { return this.get('/rest/schedule/:scheduleId', {scheduleId: scheduleId})}
        static scheduleByExpert(expertId?:number):string { return this.get('/rest/expert/:expertId/schedule', {expertId: expertId})}

        /* URL patterns for expert schedule rules*/
        static scheduleRule():string { return this.get('/rest/scheduleRule')}
        static scheduleRuleById(scheduleRuleId?:number):string { return this.get('/rest/scheduleRule/:scheduleRuleId', {scheduleRuleId: scheduleRuleId})}
        static scheduleRuleByExpert(expertId?:number):string { return this.get('/rest/expert/:expertId/scheduleRule', {expertId: expertId})}

        /* URL patterns for third party integration */
        static integration():string { return this.get('/rest/integration'); }
        static integrationById(integrationId?:number):string { return this.get('/rest/integration/:integrationId', {integrationId: integrationId}); }
        static integrationSecretReset(integrationId?:number):string { return this.get('/rest/integration/:integrationId/secret/reset', {integrationId: integrationId}); }
        static integrationMember(integrationId?:number):string { return this.get('/rest/integration/:integrationId/member', {integrationId: integrationId}); }
        static integrationMemberById(integrationId?:number, memberId?:number):string { return this.get('/rest/integration/:integrationId/member/:memberId', {integrationId: integrationId, memberId: memberId}); }
        static ownerActivitySummary(integrationId?:number):string { return this.get('/rest/integration/:integrationId/activity/summary', {integrationId: integrationId}); }

        /** URL patterns for payments **/
        static payment():string { return this.get('/rest/payment'); }
        static paymentById(paymentId?:number):string { return this.get('/rest/payment/:paymentId', {paymentId: paymentId}); }

        /** URL patterns for payout details **/
        static payoutDetail():string { return this.get('/rest/payout-detail'); }
        static payoutDetailById(payoutDetailId?:number):string { return this.get('/rest/payout-detail/:payoutDetailId', {payoutDetailId: payoutDetailId}); }

        /** URL patterns for phone calls **/
        static phoneCall():string { return this.get('/rest/call'); }
        static phoneCallById(callId?:number):string { return this.get('/rest/call/:callId', {callId: callId}); }
        static phoneCallReschedule(callId?:number):string { return this.get('/rest/call/:callId/reschedule', {callId: callId}); }
        static phoneCallCancel(callId?:number):string { return this.get('/rest/call/:callId/cancel', {callId: callId}); }

        /** URL patterns for phone numbers **/
        static phoneNumber():string { return this.get('/rest/phone-number'); }
        static phoneNumberById(phoneNumberId?:number):string { return this.get('/rest/phone-number/:phoneNumberId', {phoneNumberId: phoneNumberId}); }

        /** URL patterns for transaction **/
        static transaction():string { return this.get('/rest/transaction'); }
        static transactionById(transactionId?:number):string { return this.get('/rest/transaction/:transactionId', {transactionId: transactionId}); }
        static transactionItem(transactionId?:number):string { return this.get('/rest/transaction/:transactionId/item', {transactionId: transactionId}); }
        static transactionItemById(transactionId?:number, itemId?:number):string { return this.get('/rest/transaction/:transactionId/item/:itemId', {transactionId: transactionId, itemId: itemId}); }

        /* URL patterns for SMS */
        static sms():string { return this.get('/rest/sms'); }

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
}