"use strict";
var ForeignKey = (function () {
    function ForeignKey(type, srcKey, referenced_table, targetKey, localPropertyToSet) {
        this.type = type;
        this.src_key = srcKey;
        this.referenced_table = referenced_table;
        this.target_key = targetKey;
        this.local_property_to_set = localPropertyToSet;
    }
    // Helper method to get the name of the property to set in the base object after the results are fetched
    ForeignKey.prototype.getSourcePropertyName = function () {
        // 1. If src_key contains the property name -> Excellent
        // 2. If target_key contains the
        return this.local_property_to_set || (this.src_key.indexOf('_id') != -1 ? this.src_key.replace('_id', '') : this.target_key.replace('_id', ''));
    };
    ForeignKey.prototype.toString = function () { return '[object ForeignKey]'; };
    return ForeignKey;
}());
module.exports = ForeignKey;
//# sourceMappingURL=ForeignKey.js.map