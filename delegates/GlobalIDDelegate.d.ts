declare class GlobalIDDelegate {
    static TIMESTAMP_SHIFT: number;
    static OBJECT_TYPE_SHIFT: number;
    static SHARD_SHIFT: number;
    static OBJECT_TYPE_MASK: number;
    static SHARD_MASK: number;
    static SEQUENCE_MASK: number;
    private static timestamp;
    private static sequence;
    private static types;
    public generate(type: string, shardId?: number): number;
}
export = GlobalIDDelegate;
