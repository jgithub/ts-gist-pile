import { expect } from 'chai';
import { dateUtil } from "../../src/index";


describe('dateUtil', () => {
  describe('.generateSortedFiveMinuteBucketsForYear()', () => {
    describe('for 2023', () => {
      it('generates the expected range', () => {
        const buckets = dateUtil.generateSortedFiveMinuteBucketsForYear(2023)
        expect(buckets[0]).to.eq(1672444800)
        const minutesThisYear = 365 * 24 * 60
        const numberOf5MinuteBlocksThisYear = minutesThisYear / 5
        expect(buckets.length).to.eq(numberOf5MinuteBlocksThisYear) 
        expect(buckets[1]).to.eq(1672444800 + (5 * 60))
        expect(buckets[1]).to.eq(1672445100)
      })  
    })
    
    describe('for 2024', () => {
      it('generates the expected range', () => {
        const buckets = dateUtil.generateSortedFiveMinuteBucketsForYear(2024)
        // 2024 is leap year
        expect(buckets.length).to.eq(366 * 24 * 12) 
        expect(buckets[0]).to.eq(1703980800)
        expect(buckets[1]).to.eq(1703980800 + (5 * 60))
        expect(buckets[1]).to.eq(1703981100)
      })  
    })
  })  
})