import BaseModel                                      = require('./BaseModel');

class UserWorkDetail extends BaseModel
{
    static TABLE_NAME:string = 'user_employment';

    static USER_ID:string = 'user_id';
    static TITLE:string = 'title';
    static SUMMARY:string = 'summary';
    static START_DATE:string = 'start_date';
    static END_DATE:string = 'end_date';
    static IS_CURRENT:string = 'is_current';
    static COMPANY:string = 'company';

    private user_id:number;
    private title:string;
    private summary:string;
    private start_date:string;
    private end_date:string;
    private is_current:boolean;
    private company:string;


    /* Getters */
    getUserId():number              { return this.user_id; }
    getTitle():string               { return this.title; }
    getSummary():string             { return this.summary; }
    getStartDate():string           { return this.start_date; }
    getEndDate():string             { return this.end_date; }
    getIsCurrent():boolean          { return this.is_current; }
    getCompany():string             { return this.company; }
    /* Setters */
    setUserId(val:number):void      { this.user_id = val; }
    setTitle(val:string):void       { this.title = val; }
    setSummary(val:string):void     { this.summary = val; }
    setStartDate(val:string):void   { this.start_date = val; }
    setEndDate(val:string):void     { this.end_date = val; }
    setIsCurrent(val:boolean):void  { this.is_current = val; }
    setCompany(val:string):void     { this.company = val; }
}
export = UserWorkDetail