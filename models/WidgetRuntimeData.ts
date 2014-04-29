import MoneyUnit                                        = require('../enums/MoneyUnit');
import Utils                                            = require('../common/Utils');

class WidgetRuntimeData
{
    private price:number;
    private price_unit:MoneyUnit;
    private is_available:boolean;
    private next_start_time:number;
    private next_slot_duration:number;

    isValid():boolean
    {
        return !Utils.isNullOrEmpty(this.getPrice())
                && !Utils.isNullOrEmpty(this.getPriceUnit())
                    && !Utils.isNullOrEmpty(this.getIsAvailable());
    }

    /* Getters */
    getPrice():number                                   { return this.price; }
    getPriceUnit():MoneyUnit                            { return this.price_unit; }
    getIsAvailable():boolean                            { return this.is_available; }
    getNextSlotStartTime():number                       { return this.next_start_time; }
    getNextSlotDuration():number                        { return this.next_slot_duration; }

    /* Setters */
    setPrice(val:number)                                { return this.price; }
    setPriceUnit(val:MoneyUnit)                         { return this.price_unit; }
    setIsAvailable(val:boolean)                         { return this.is_available; }
    setNextSlotStartTime(val:number)                    { return this.next_start_time; }
    setNextSlotDuration(val:number)                     { return this.next_slot_duration; }
}
export = WidgetRuntimeData