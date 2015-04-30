var GlobalIDDelegate = (function () {
    function GlobalIDDelegate() {
    }
    GlobalIDDelegate.prototype.generate = function (type, shardId) {
        if (shardId === void 0) { shardId = 1; }
        var now = Math.floor(new Date().getTime());
        if (GlobalIDDelegate.timestamp != now) {
            GlobalIDDelegate.sequence = 1;
            GlobalIDDelegate.timestamp = now;
        }
        else if (GlobalIDDelegate.sequence >= GlobalIDDelegate.SEQUENCE_MASK) {
            GlobalIDDelegate.timestamp = now;
            GlobalIDDelegate.sequence = 1;
        }
        var timestampComponent = now << GlobalIDDelegate.TIMESTAMP_SHIFT;
        var objectTypeComponent = ((GlobalIDDelegate.types[type] || 1) & GlobalIDDelegate.OBJECT_TYPE_MASK) << GlobalIDDelegate.OBJECT_TYPE_SHIFT;
        var shardComponent = (shardId & GlobalIDDelegate.SHARD_MASK) << GlobalIDDelegate.SHARD_SHIFT;
        var sequenceComponent = GlobalIDDelegate.sequence & GlobalIDDelegate.SEQUENCE_MASK;
        var gid = timestampComponent | objectTypeComponent | shardComponent | sequenceComponent;
        GlobalIDDelegate.sequence++;
        return Math.abs(gid);
    };
    GlobalIDDelegate.TIMESTAMP_SHIFT = 13;
    GlobalIDDelegate.OBJECT_TYPE_SHIFT = 11;
    GlobalIDDelegate.SHARD_SHIFT = 9;
    GlobalIDDelegate.OBJECT_TYPE_MASK = 0x3;
    GlobalIDDelegate.SHARD_MASK = 0x3;
    GlobalIDDelegate.SEQUENCE_MASK = 0x1ff;
    GlobalIDDelegate.sequence = 0;
    GlobalIDDelegate.types = {
        'user': 1
    };
    return GlobalIDDelegate;
})();
module.exports = GlobalIDDelegate;
//# sourceMappingURL=GlobalIDDelegate.js.map