class SaveStatsKey
{
    static MEMBER_CREATED:string                                    = 'memberCreated';
    static FETCH_FROM_LINKEDIN:string                               = 'fetchFromLinkedIn';
    static CALL_SCHEDULED:string                                    = 'callScheduled';

    static keys:string[] = [SaveStatsKey.MEMBER_CREATED, SaveStatsKey.FETCH_FROM_LINKEDIN, SaveStatsKey.CALL_SCHEDULED];
}
export = SaveStatsKey