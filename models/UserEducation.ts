import BaseModel                                      = require('./BaseModel');

class UserEducation extends BaseModel
{
    static TABLE_NAME:string = 'user_education';

    static COL_START_YEAR:string = 'start_year';
    static COL_END_YEAR:string = 'end_year';
    static COL_DEGREE:string = 'degree';
    static COL_FIELD_OF_STUDY:string = 'field_of_study';
    static COL_SCHOOL_NAME:string = 'school_name';
    static COL_ACTIVITIES:string = 'activities';
    static COL_NOTES:string = 'notes';
    static COL_USER_ID:string = 'user_id';

    static DEFAULT_FIELDS:string[] = [UserEducation.COL_ID, UserEducation.COL_USER_ID, UserEducation.COL_START_YEAR, UserEducation.COL_END_YEAR, UserEducation.COL_DEGREE,
        UserEducation.COL_FIELD_OF_STUDY, UserEducation.COL_SCHOOL_NAME, UserEducation.COL_ACTIVITIES, UserEducation.COL_NOTES];

    private start_year:number;
    private end_year:number;
    private degree:string;
    private field_of_study:string;
    private school_name:string;
    private activities:string;
    private notes:string;
    private user_id:number;

    /* Getters */
    getStartYear():number           { return this.start_year; }
    getEndYear():number             { return this.end_year; }
    getDegree():string              { return this.degree; }
    getFieldOfStudy():string        { return this.field_of_study; }
    getSchoolName():string          { return this.school_name; }
    getActivities():string          { return this.activities; }
    getNotes():string               { return this.notes; }
    getUserId():number              { return this.user_id; }

    /* Setters */
    setStartYear(val:number):void   { this.start_year = val; }
    setEndYear(val:number):void     { this.end_year = val; }
    setDegree(val:string):void      { this.degree = val; }
    setFieldOfStudy(val:string):void{ this.field_of_study = val; }
    setSchoolName(val:string):void  { this.school_name = val; }
    setActivities(val:string):void  { this.activities = val; }
    setNotes(val:string):void       { this.notes = val; }
    setUserId(val:number):void      { this.user_id = val; }
}
export = UserEducation