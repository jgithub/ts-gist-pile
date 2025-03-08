import { expect } from 'chai';
import { DateProviderService, arrayUtil } from "../../src/index";


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

        expect(arrayUtil.tryParseStringToArray('hello;there,world friend')).to.deep.equal(["hello","there","world","friend"])


      })  
    })
  })
})