import { expect } from 'chai';
import { arrayUtil } from "../../src/index";


describe('arrayUtil', () => {
  describe('.tryParseStringToArray()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => { 
        expect(arrayUtil.tryParseStringToArray(null as unknown as string)).to.deep.equal([])
        expect(arrayUtil.tryParseStringToArray(undefined as unknown as string)).to.deep.equal([])
        expect(arrayUtil.tryParseStringToArray('')).to.deep.equal([])
        expect(arrayUtil.tryParseStringToArray('   ')).to.deep.equal([])
        expect(arrayUtil.tryParseStringToArray('  hello ')).to.deep.equal(["hello"])
        expect(arrayUtil.tryParseStringToArray('  hello world  ')).to.deep.equal(["hello", "world"])
        expect(arrayUtil.tryParseStringToArray('  hello ; world  ')).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray('  hello , world  ')).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray('hello,world')).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray('[hello,world]')).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray('["hello","world"]')).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray(`['hello','world']`)).to.deep.equal(["hello","world"])
        expect(arrayUtil.tryParseStringToArray(',world')).to.deep.equal(["world"])
        expect(arrayUtil.tryParseStringToArray('hello',)).to.deep.equal(["hello"])
        expect(arrayUtil.tryParseStringToArray('hello,,,,,world')).to.deep.equal(["hello", "world"])
        expect(arrayUtil.tryParseStringToArray('hello;2,world friend')).to.deep.equal(["hello","2","world","friend"])
        expect(arrayUtil.tryParseStringToArray('77')).to.deep.equal(["77"])
        expect(arrayUtil.tryParseStringToArray('7.8')).to.deep.equal(["7.8"])
        expect(arrayUtil.tryParseStringToArray('1,234')).to.deep.equal(["1","234"])
      })  
    })
  })

  describe('.hasExactlyOneItem()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => { 
        expect(arrayUtil.hasExactlyOneItem(null as unknown as any[])).to.be.false
        expect(arrayUtil.hasExactlyOneItem(undefined as unknown as any[])).to.be.false
        expect(arrayUtil.hasExactlyOneItem(3 as unknown as any[])).to.be.false
        expect(arrayUtil.hasExactlyOneItem("hello" as unknown as any[])).to.be.false
        expect(arrayUtil.hasExactlyOneItem([])).to.be.false
        expect(arrayUtil.hasExactlyOneItem([1,2])).to.be.false
        expect(arrayUtil.hasExactlyOneItem([1])).to.be.true
        expect(arrayUtil.hasExactlyOneItem(["hello"])).to.be.true
        expect(arrayUtil.hasExactlyOneItem([])).to.be.false
        expect(arrayUtil.hasExactlyOneItem([undefined])).to.be.true
        expect(arrayUtil.hasExactlyOneItem([null])).to.be.true
        expect(arrayUtil.hasExactlyOneItem([""])).to.be.true
      })  
    })
  })

  describe('.isPopulated()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => { 
        expect(arrayUtil.isPopulated(null as unknown as any[])).to.be.false
        expect(arrayUtil.isPopulated(undefined as unknown as any[])).to.be.false
        expect(arrayUtil.isPopulated(3 as unknown as any[])).to.be.false
        expect(arrayUtil.isPopulated("hello" as unknown as any[])).to.be.false
        expect(arrayUtil.isPopulated([])).to.be.false
        expect(arrayUtil.isPopulated([1,2])).to.be.true
        expect(arrayUtil.isPopulated([1])).to.be.true
        expect(arrayUtil.isPopulated(["hello"])).to.be.true
        expect(arrayUtil.isPopulated([])).to.be.false
        expect(arrayUtil.isPopulated([undefined])).to.be.true
        expect(arrayUtil.isPopulated([null])).to.be.true
        expect(arrayUtil.isPopulated([""])).to.be.true
      })  
    })
  })
})