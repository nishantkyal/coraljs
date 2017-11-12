"use strict";
const AbstractModel = require("./AbstractModel");
class BaseModel extends AbstractModel {
    getId() { return this.id; }
    getCreated() { return this.created; }
    getUpdated() { return this.updated; }
    getDeleted() { return this.deleted; }
    setId(val) { this.id = val; }
    setCreated(val) { this.created = val; }
    setUpdated(val) { this.updated = val; }
    setDeleted(val) { this.deleted = val; }
    isValid() { return true; }
}
BaseModel.COL_ID = 'id';
BaseModel.COL_CREATED = 'created';
BaseModel.COL_UPDATED = 'updated';
BaseModel.COL_DELETED = 'deleted';
module.exports = BaseModel;
//# sourceMappingURL=BaseModel.js.map