import { DateProviderService, dateUtil, TimestampBucketMakingService } from "..";

export class TimestampBucketMakingServiceImpl implements TimestampBucketMakingService {
  constructor(
    private readonly dateProviderService: DateProviderService
  ){}
  /**
   * Return value is a sorted array of bucket starting times since epoch in Seconds
   * @param year 
   */
  public gengetSorted5MinuteBucketsForYear(year: number): ReadonlyArray<number> {
    return dateUtil.generateSortedFiveMinuteBucketsForYear(year)
  }

  public getMyCurrent5MinuteBucketStartTimeSecondsSinceEpoch(): number {
    const nowInSeconds = this.dateProviderService.getNow().getTime() / 1000
    const array = this.gengetSorted5MinuteBucketsForYear(this.dateProviderService.getNow().getUTCFullYear())
    for (let ii = 0; ii < array.length; ++ii) {
      // as soon as we are bigger than one we found the 
      // right one
      const item = array[ii]
      if (nowInSeconds > item) {
        return item
      }
    }
    throw new Error("Can't reach here")
  }
}