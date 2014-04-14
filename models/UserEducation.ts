import BaseModel                                      = require('./BaseModel');

class UserEducation extends BaseModel
{
    static TABLE_NAME:string = 'user_education';

    static USER_ID:string = 'user_id';
    static START_YEAR:string = 'start_year';
    static END_YEAR:string = 'end_year';
    static DEGREE:string = 'degree';
    static FIELD_OF_STUDY:string = 'field_of_study';
    static SCHOOL_NAME:string = 'school_name';
    static ACTIVITIES:string = 'activities';
    static NOTES:string = 'notes';

    static DEFAULT_FIELDS:string[] = [UserEducation.ID, UserEducation.USER_ID,UserEducation.START_YEAR, UserEducation.END_YEAR, UserEducation.DEGREE,
        UserEducation.FIELD_OF_STUDY, UserEducation.SCHOOL_NAME, UserEducation.ACTIVITIES, UserEducation.NOTES];

    private user_id:number;
    private start_year:number;
    private end_year:number;
    private degree:string;
    private field_of_study:string;
    private school_name:string;
    private activities:string;
    private notes:string;

    /* Getters */
    getUserId():number              { return this.user_id; }
    getStartYear():number           { return this.start_year; }
    getEndYear():number             { return this.end_year; }
    getDegree():string              { return this.degree; }
    getFieldOfStudy():string        { return this.field_of_study; }
    getSchoolName():string          { return this.school_name; }
    getActivities():string          { return this.activities; }
    getNotes():string               { return this.notes; }

    /* Setters */
    setUserId(val:number):void      { this.user_id = val; }
    setStartYear(val:number):void   { this.start_year = val; }
    setEndYear(val:number):void     { this.end_year = val; }
    setDegree(val:string):void      { this.degree = val; }
    setFieldOfStudy(val:string):void{ this.field_of_study = val; }
    setSchoolName(val:string):void  { this.school_name = val; }
    setActivities(val:string):void  { this.activities = val; }
    setNotes(val:string):void       { this.notes = val; }
}
export = UserEducation