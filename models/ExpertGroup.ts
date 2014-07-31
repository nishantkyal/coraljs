import BaseModel                                        = require('./BaseModel');

class ExpertGroup extends BaseModel
{
    static TABLE_NAME:string = 'expert_group';

    static COL_NAME:string                                  = 'name';
    static COL_CREATED_BY:string                            = 'created_by';

    private name:string;
    private created_by:number;

    /* Getters */
    getName():string                                    { return this.name; }
    getCreatedBy():number                               { return this.created_by; }

    /* Setters */
    setName(val:string)                                 { this.name = val; }
    setCreatedBy(val:number)                            { this.created_by = val; }
}
export = ExpertGroup