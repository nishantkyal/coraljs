import BaseModel                                      = require('./BaseModel');

class UserEmployment extends BaseModel
{
    static TABLE_NAME:string = 'user_employment';

    static TITLE:string = 'title';
    static SUMMARY:string = 'summary';
    static START_DATE:string = 'start_date';
    static END_DATE:string = 'end_date';
    static IS_CURRENT:string = 'is_current';
    static COMPANY:string = 'company';

    private title:string;
    private summary:string;
    private start_date:string;
    private end_date:string;
    private is_current:boolean;
    private company:string;

    static DEFAULT_FIELDS:string[] = [UserEmployment.ID,UserEmployment.TITLE, UserEmployment.SUMMARY, UserEmployment.START_DATE,
        UserEmployment.END_DATE, UserEmployment.IS_CURRENT,UserEmployment.COMPANY];

    /* Getters */
    getTitle():string               { return this.title; }
    getSummary():string             { return this.summary; }
    getStartDate():string           { return this.start_date; }
    getEndDate():string             { return this.end_date; }
    getIsCurrent():boolean          { return this.is_current; }
    getCompany():string             { return this.company; }
    /* Setters */
    setTitle(val:string):void       { this.title = val; }
    setSummary(val:string):void     { this.summary = val; }
    setStartDate(val:string):void   { this.start_date = val; }
    setEndDate(val:string):void     { this.end_date = val; }
    setIsCurrent(val:boolean):void  { this.is_current = val; }
    setCompany(val:string):void     { this.company = val; }
}
export = UserEmployment