
var Utils = require('../Utils');

/**
* Delegate to generate globally unique ids
* Format of id:
*  [ timestamp (42 bits) | type (2bits) | shard (2 bits) | sequence (9 bits) ]
*
* We generate a max number of sequence numbers per millisecond, so that length of sequence remains fixed and we can generate a lot of sequence numbers per millisecond
*/
var GlobalIDDelegate = (function () {
    function GlobalIDDelegate() {
    }
    GlobalIDDelegate.prototype.generate = function (type, shardId) {
        if (typeof shardId === "undefined") { shardId = 1; }
        var now = Math.floor(new Date().getTime() / 1000);

        if (GlobalIDDelegate.timestamp != now) {
            GlobalIDDelegate.sequence = 1;
            GlobalIDDelegate.timestamp = now;
        } else if (GlobalIDDelegate.sequence >= GlobalIDDelegate.SEQUENCE_MASK) {
            // TODO: Wait for next second
            GlobalIDDelegate.timestamp = now;
            GlobalIDDelegate.sequence = 1;
        }

        var timestampComponent = now << GlobalIDDelegate.TIMESTAMP_SHIFT;
        var objectTypeComponent = (GlobalIDDelegate.types[type] & GlobalIDDelegate.OBJECT_TYPE_MASK) << GlobalIDDelegate.OBJECT_TYPE_SHIFT;
        var shardComponent = (shardId & GlobalIDDelegate.SHARD_MASK) << GlobalIDDelegate.SHARD_SHIFT;
        var sequenceComponent = GlobalIDDelegate.sequence & GlobalIDDelegate.SEQUENCE_MASK;

        var gid = timestampComponent | objectTypeComponent | shardComponent | sequenceComponent;

        GlobalIDDelegate.sequence++;

        return gid;
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

