///<reference path='../_references.d.ts'/>
import q                                                    = require('q');
import WidgetExpert                                         = require('../models/WidgetExpert');

class WidgetExpertDelegate
{
    get(expertResourceId:number):q.Promise<any>
    {
        return null;
    }

    set(expertResourceId:number, expertData:WidgetExpert):q.Promise<any>
    {
        return null;
    }
}
export = WidgetExpertDelegate