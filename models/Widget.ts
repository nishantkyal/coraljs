import BaseModel                                        = require('../models/BaseModel');

/**
 * Style settings
 * - Color theme
 * - Font
 *
 * Display settings
 * - Next available slot
 * - Pick appointment slots
 * - Agenda field
 * - Number of experts to display
 */
class Widget extends BaseModel
{
    static TABLE_NAME:string = 'widget';

    static TEMPLATE:string                              = 'template';
    static SETTINGS:string                              = 'settings';
    static USER_ID:string                               = 'user_id';

    static DEFAULT_FIELDS:string[] = [Widget.ID, Widget.SETTINGS, Widget.TEMPLATE, Widget.USER_ID];

    private template:string;
    private settings:Object;
    private user_id:number;

    /* Getters */
    getTemplate():string                                { return this.template; }
    getSettings():Object                                { return this.settings; }
    getUserId():number                                  { return this.user_id; }

    /* Setters */
    setTemplate(val:string)                             { this.template = val; }
    setSettings(val:Object)                             { this.settings = val; }
    setUserId(val:number)                               { this.user_id = val; }
}
export = Widget