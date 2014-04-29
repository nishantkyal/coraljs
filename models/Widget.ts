import BaseModel                                        = require('../models/BaseModel');
import WidgetType                                       = require('../enums/WidgetType');

/**
 *
 * Style settings
 * - Color theme
 * - Font
 *
 * Expert Settings:
 * - Name
 * - Availability
 * - Cost
 * - Location and TZ
 * - Keywords
 * - Summary
 * - Profile picture
 * - User feedback
 * - Network rating
 * - Next available slot
 * - Pick appointment slots
 * - Agenda field
 * - Number of experts to display
 */
class Widget extends BaseModel
{
    static TABLE_NAME:string = 'widget';

    static TYPE:string                                  = 'type';
    static SETTINGS:string                              = 'settings';
    static EXPERT_RESOURCE_ID:string                    = 'expert_resource_id';

    private type:WidgetType;
    private settings:Object;
    private expert_resource_id:number;                  // Can be expert_id or expert_group_id or integration_id, so that we can choose what expert or group of experts to display

    /* Getters */
    getType():WidgetType                                { return this.type; }
    getSettings():Object                                { return this.settings; }
    getExpertResourceId():number                        { return this.expert_resource_id; }

    /* Setters */
    setType(val:WidgetType)                             { this.type = val; }
    setSettings(val:Object)                             { this.settings = val; }
    setExpertResourceId(val:number)                     { this.expert_resource_id = val; }
}
export = Widget