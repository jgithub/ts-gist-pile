export interface TimestampBucketMakingService {
  /**
   * Return value is a sorted array of bucket starting times since epoch in Seconds
   * @param year 
   */
  gengetSorted5MinuteBucketsForYear(year: number): ReadonlyArray<number>
  getMyCurrent5MinuteBucketStartTimeSecondsSinceEpoch(): number
}