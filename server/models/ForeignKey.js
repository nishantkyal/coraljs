"use strict";
class ForeignKey {
    constructor(type, srcKey, referenced_table, targetKey, localPropertyToSet) {
        this.type = type;
        this.src_key = srcKey;
        this.referenced_table = referenced_table;
        this.target_key = targetKey;
        this.local_property_to_set = localPropertyToSet;
    }
    getSourcePropertyName() {
        return this.local_property_to_set || (this.src_key.indexOf('_id') != -1 ? this.src_key.replace('_id', '') : this.target_key.replace('_id', ''));
    }
    toString() { return '[object ForeignKey]'; }
}
module.exports = ForeignKey;
//# sourceMappingURL=ForeignKey.js.map