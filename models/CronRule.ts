///<reference path='../_references.d.ts'/>
import _                                            = require('underscore');
import Utils                                        = require('../common/Utils');

class CronRule
{
    /* Get valid values for a cron pattern */
    static getValues(ruleString:string):string[][]
    {
        return _.map(ruleString.split(' '), CronRule.patternToValues);
    }

    /* Helper method to get valid values for a single cron pattern part */
    private static patternToValues(part:string):string[]
    {
        if (part.indexOf(',') != -1)
            return part.split(',');
        else if (part.indexOf('-') != -1)
        {
            var rangeValues = [];
            for (var i:number = parseInt(part.split('-')[0]); i <= parseInt(part.split('-')[1]); i++)
                rangeValues.push(i.toString());
            return rangeValues;
        } else if (part == '*')
        // TODO: Compute correct allowed values based on the field
            return null;
        else
            return [part];
    }

    /* Generate pattern from user input values */
    static fromValues(values:string[][]):string
    {
        return _.map(values, function (vals:string[])
        {
            return CronRule.valuesToPattern(vals);
        }).join(' ');
    }

    /* Helper method to convert a single cron part to pattenrn */
    private static valuesToPattern(values:any[]):string
    {
        return Utils.isNullOrEmpty(values) ? '*' : values.join(',');
    }
}
export = CronRule