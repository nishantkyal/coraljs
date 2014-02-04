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

function init(app)
{
    new api.ExpertApi(app);
    new api.ExpertScheduleApi(app);
    new api.ExpertScheduleRulesApi(app);
    new api.IntegrationApi(app);
    new api.IntegrationOwnerApi(app);
    new api.PaymentApi(app);
    new api.PayoutDetailApi(app);
    new api.PhoneCallApi(app);
    new api.PhoneNumberApi(app);
    new api.SmsApi(app);
    new api.TransactionApi(app);
    new api.TwimlApi(app);
    new api.UserApi(app);
}
export = init