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

    static INTEGRATION_MEMBER_ID:string                 = 'integration_member_id';
    static TEMPLATE:string                              = 'template';
    static SETTINGS:string                              = 'settings';
    static EXPERT_ID:string                             = 'expert_id';

    static DEFAULT_FIELDS:string[] = [Widget.ID, Widget.EXPERT_ID, Widget.SETTINGS, Widget.TEMPLATE, Widget.INTEGRATION_MEMBER_ID];

    private integration_member_id:number;
    private template:string;
    private settings:Object;
    private expert_id:number;

    /* Getters */
    getIntegrationMemberId():number                     { return this.integration_member_id; }
    getTemplate():string                                { return this.template; }
    getSettings():Object                                { return this.settings; }
    getExpertId():number                                { return this.expert_id; }

    /* Setters */
    setIntegrationMemberId(val:number)                  { this.integration_member_id = val; }
    setTemplate(val:string)                             { this.template = val; }
    setSettings(val:Object)                             { this.settings = val; }
    setExpertId(val:number)                             { this.expert_id = val; }
}
export = Widget