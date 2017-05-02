var ForeignKey = (function () {
    function ForeignKey(type, srcKey, referenced_table, targetKey, localPropertyToSet) {
        this.type = type;
        this.src_key = srcKey;
        this.referenced_table = referenced_table;
        this.target_key = targetKey;
        this.local_property_to_set = localPropertyToSet;
    }
    ForeignKey.prototype.getSourcePropertyName = function () {
        return this.local_property_to_set || (this.src_key.indexOf('_id') != -1 ? this.src_key.replace('_id', '') : this.target_key.replace('_id', ''));
    };
    ForeignKey.prototype.toString = function () {
        return '[object ForeignKey]';
    };
    return ForeignKey;
})();
module.exports = ForeignKey;
//# sourceMappingURL=ForeignKey.js.map