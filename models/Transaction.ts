///<reference path='./BaseModel.ts'/>

module models
{
    export class Transaction extends BaseModel
    {
        static TABLE_NAME:string = 'transaction';

        private user_id:number;
        private total:number;
        private total_unit:number;
        private status:number;

        /* Getters */
        getUserId():number { return this.user_id; }
        getTotal():number { return this.total; }
        getTotalUnit():number { return this.total_unit; }
        getStatus():number { return this.status; }

        /* Setters */
        setUserId(val:number):void { this.user_id = val; }
        setTotal(val:number):void { this.total = val; }
        setTotalUnit(val:number):void { this.total_unit = val; }
        setStatus(val:number):void { this.status = val; }

    }
}