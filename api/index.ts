///<reference path='./ExpertApi.ts'/>
///<reference path='./ExpertScheduleApi.ts'/>
///<reference path='./ExpertScheduleRulesApi.ts'/>
///<reference path='./IntegrationApi.ts'/>
///<reference path='./IntegrationOwnerApi.ts'/>
///<reference path='./PaymentApi.ts'/>
///<reference path='./PayoutDetailApi.ts'/>
///<reference path='./PhoneCallApi.ts'/>
///<reference path='./PhoneNumberApi.ts'/>
///<reference path='./SMSApi.ts'/>
///<reference path='./TransactionApi.ts'/>
///<reference path='./TwimlApi.ts'/>
///<reference path='./UserApi.ts'/>
module api {
    export function init(app)
    {
        new ExpertApi(app);
        new ExpertScheduleApi(app);
        new ExpertScheduleRulesApi(app);
        new IntegrationApi(app);
        new IntegrationOwnerApi(app);
        new PaymentApi(app);
        new PayoutDetailApi(app);
        new PhoneCallApi(app);
        new PhoneNumberApi(app);
        new SmsApi(app);
        new TransactionApi(app);
        new TwimlApi(app);
        new UserApi(app);
    }
}