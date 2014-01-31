///<reference path='../_references.d.ts'/>
///<reference path='./BaseModel.ts'/>
///<reference path='../enums/Priority.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../delegates/LocalizationDelegate.ts'/>

module models
{
    export class SMS extends BaseModel
    {
        static TABLE_NAME:string = 'sms';

        private country_code:string;
        private phone:number;
        private sender:string;
        private message:string;
        private scheduled_date:number;
        private status:number;
        private num_retries:number;
        private priority:enums.Priority;

        constructor(data:Object = {})
        {
            super(data);

            // Compose message based on SMS type
            if (common.Utils.isNullOrEmpty(this.getMessage()))
            {
                try
                {
                    var smsData:Object = data['data'];
                    var smsType:string = 'sms.' + smsData['type'];
                    var locale:string = smsData['locale'];
                    var templateData:Object = smsData['data'];
                    var template:Function = _.template(delegates.LocalizationDelegate.get(smsType, locale));

                    this.setMessage(template(templateData));
                } catch (e) {}
            }

        }

        /* Getters */
        getCountryCode():string { return this.country_code; }
        getPhone():number { return this.phone; }
        getSender():string { return this.sender; }
        getMessage():string { return this.message; }
        getScheduledDate():number { return this.scheduled_date; }
        getStatus():number { return this.status; }
        getNumRetries():number { return this.num_retries; }
        getPriority():enums.Priority { return this.priority; }

        /* Setters */
        setCountryCode(val:string):void { this.country_code = val; }
        setPhone(val:number):void { this.phone = val; }
        setSender(val:string):void { this.sender = val; }
        setMessage(val:string):void { this.message = val; }
        setScheduledDate(val:number):void { this.scheduled_date = val; }
        setStatus(val:number):void { this.status = val; }
        setNumRetries(val:number):void { this.num_retries = val; }
        setPriority(val:enums.Priority):void { this.priority = val; }

        isValid():boolean {
            return !common.Utils.isNullOrEmpty(this.getPhone()) && !common.Utils.isNullOrEmpty(this.getCountryCode()) && !common.Utils.isNullOrEmpty(this.getMessage());
        }
    }
}