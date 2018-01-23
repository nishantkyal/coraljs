import Utils            = require('../common/Utils');

/*
 * Delegate to generate globally unique ids
 * Format of id:
 *  [ timestamp (42 bits) | type (2bits) | shard (2 bits) | sequence (9 bits) ]
 *
 * We generate a max number of sequence numbers per millisecond, so that length of sequence remains fixed and we can generate a lot of sequence numbers per millisecond
 */
class GlobalIDDelegate
{
    static TIMESTAMP_SHIFT:number = 13;
    static OBJECT_TYPE_SHIFT:number = 11;
    static SHARD_SHIFT:number = 9;

    static OBJECT_TYPE_MASK:number = 0x3;
    static SHARD_MASK:number = 0x3;
    static SEQUENCE_MASK:number = 0x1ff;

    private static timestamp:number;
    private static sequence:number = 0;

    private static types = {
        'user': 1
    };

    generate(type:string, shardId:number = 1):number
    {
        var now = Math.floor(new Date().getTime());

        if (GlobalIDDelegate.timestamp != now)
        {
            GlobalIDDelegate.sequence = 1;
            GlobalIDDelegate.timestamp = now;
        }
        else if (GlobalIDDelegate.sequence >= GlobalIDDelegate.SEQUENCE_MASK)
        {
            // TODO: Wait for next second
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
    }

}
export = GlobalIDDelegate