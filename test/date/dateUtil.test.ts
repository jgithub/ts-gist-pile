import { expect } from 'chai';
import { dateUtil } from "../../src/index";


describe('dateUtil', () => {
  describe('.generateSortedFiveMinuteBucketsForYearInSeconds()', () => {
    describe('for 2023', () => {
      it('generates the expected range', () => {
        const buckets = dateUtil.generateSortedFiveMinuteBucketsForYearInSeconds(2023)
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
        const beforeAt = new Date()
        const buckets = dateUtil.generateSortedFiveMinuteBucketsForYearInSeconds(2024)
        expect(dateUtil.getMillisecondsBetweenDates(beforeAt, new Date())).to.be.lt(10)
        // 2024 is leap year
        expect(buckets.length).to.eq(366 * 24 * 12) 
        expect(buckets[0]).to.eq(1703980800)
        expect(buckets[1]).to.eq(1703980800 + (5 * 60))
        expect(buckets[1]).to.eq(1703981100)
      })  
    })
  })  


  describe('.dateToYyyyMmDdNumberAtUtc()', () => {
    it('returns YYYYMMDD integer for a known date', () => {
      const date = new Date('2026-02-12T15:30:00Z')
      expect(dateUtil.dateToYyyyMmDdNumberAtUtc(date)).to.eq(20260212)
    })

    it('uses UTC, not local time', () => {
      // 2026-01-31 at 23:59 UTC — local timezone must not push it to Feb 1
      const date = new Date('2026-01-31T23:59:59Z')
      expect(dateUtil.dateToYyyyMmDdNumberAtUtc(date)).to.eq(20260131)
    })

    it('handles single-digit month and day', () => {
      const date = new Date('2026-01-01T00:00:00Z')
      expect(dateUtil.dateToYyyyMmDdNumberAtUtc(date)).to.eq(20260101)
    })

    it('handles leap day', () => {
      const date = new Date('2024-02-29T12:00:00Z')
      expect(dateUtil.dateToYyyyMmDdNumberAtUtc(date)).to.eq(20240229)
    })

    it('handles end of year', () => {
      const date = new Date('2025-12-31T23:59:59Z')
      expect(dateUtil.dateToYyyyMmDdNumberAtUtc(date)).to.eq(20251231)
    })
  })

  describe('.isValidDateObject()', () => {
    describe('for a variety of common inputs', () => {
      it('generates the expected result', () => {
        expect(dateUtil.isValidDateObject(null)).to.be.false
        expect(dateUtil.isValidDateObject(undefined)).to.be.false
        expect(dateUtil.isValidDateObject("")).to.be.false
        expect(dateUtil.isValidDateObject("hello")).to.be.false
        expect(dateUtil.isValidDateObject(11)).to.be.false
        expect(dateUtil.isValidDateObject(11.0)).to.be.false
        expect(dateUtil.isValidDateObject(new Date())).to.be.true
        expect(dateUtil.isValidDateObject(new Date(0))).to.be.true
        expect(dateUtil.isValidDateObject(new Date('hello'))).to.be.false

        const isThisAValidDate = new Date('hello')
        expect(isThisAValidDate.toString()).to.eq('Invalid Date')
        expect(isThisAValidDate.getMonth()).to.be.NaN

      })
    })
  })

})