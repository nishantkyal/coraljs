class CronRule
{
    private second:string;
    private minute:string;
    private hour:string;
    private day_of_month:string;
    private month:string;
    private day_of_week:string;

    private _pattern:string;

    constructor(pattern:string)
    {

    }

    getSecond():string                             { return this.second; }
    getMinute():string                             { return this.minute; }
    getHour():string                               { return this.hour; }
    getDayOfMonth():string                         { return this.day_of_month; }
    getMonth():string                              { return this.month; }
    getDayOfWeek():string                          { return this.day_of_week; }

    setSecond(val:string):void                     { this.second = val; }
    setMinute(val:string):void                     { this.minute = val; }
    setHour(val:string):void                       { this.hour = val; }
    setDayOfMonth(val:string):void                 { this.day_of_month = val; }
    setMonth(val:string):void                      { this.month = val; }
    setDayOfWeek(val:string):void                  { this.day_of_week = val; }

    toString():string
    {
        return null;
    }
}
export = CronRule