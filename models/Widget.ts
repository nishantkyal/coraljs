import BaseModel                                        = require('../models/BaseModel');
import WidgetType                                       = require('../enums/WidgetType');

class Widget extends BaseModel
{
    private type:WidgetType;
    private settings:Object;

    /* Getters */
    getType():WidgetType                                { return this.type; }
    getSettings():Object                                { return this.settings; }

    /* Setters */
    setType(val:WidgetType)                             { this.type = val; }
    setSettings(val:Object)                             { this.settings = val; }
}
export = Widget