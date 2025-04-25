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
        expect(dateUtil.getMillisecondsSinceDate(beforeAt)).to.be.lt(10)
        // 2024 is leap year
        expect(buckets.length).to.eq(366 * 24 * 12) 
        expect(buckets[0]).to.eq(1703980800)
        expect(buckets[1]).to.eq(1703980800 + (5 * 60))
        expect(buckets[1]).to.eq(1703981100)
      })  
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