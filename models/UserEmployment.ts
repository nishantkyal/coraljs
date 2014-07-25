import BaseModel                                      = require('./BaseModel');

class UserEmployment extends BaseModel
{
    static TABLE_NAME:string = 'user_employment';

    static COL_TITLE:string = 'title';
    static COL_SUMMARY:string = 'summary';
    static COL_START_DATE:string = 'start_date';
    static COL_END_DATE:string = 'end_date';
    static COL_IS_CURRENT:string = 'is_current';
    static COL_COMPANY:string = 'company';
    static COL_USER_ID:string = 'user_id';


    private title:string;
    private summary:string;
    private start_date:number;
    private end_date:number;
    private is_current:boolean;
    private company:string;
    private user_id:number;

    static DEFAULT_FIELDS:string[] = [UserEmployment.COL_ID, UserEmployment.COL_USER_ID, UserEmployment.COL_TITLE, UserEmployment.COL_SUMMARY, UserEmployment.COL_START_DATE,
        UserEmployment.COL_END_DATE, UserEmployment.COL_IS_CURRENT, UserEmployment.COL_COMPANY];

    /* Getters */
    getTitle():string               { return this.title; }
    getSummary():string             { return this.summary; }
    getStartDate():number           { return this.start_date; }
    getEndDate():number             { return this.end_date; }
    getIsCurrent():boolean          { return this.is_current; }
    getCompany():string             { return this.company; }
    getUserId():number              { return this.user_id; }

    /* Setters */
    setTitle(val:string):void       { this.title = val; }
    setSummary(val:string):void     { this.summary = val; }
    setStartDate(val:number):void   { this.start_date = val; }
    setEndDate(val:number):void     { this.end_date = val; }
    setIsCurrent(val:boolean):void  { this.is_current = val; }
    setCompany(val:string):void     { this.company = val; }
    setUserId(val:number):void      { this.user_id = val; }
}
export = UserEmployment