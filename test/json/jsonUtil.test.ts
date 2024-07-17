import { expect } from 'chai';
import { jsonUtil } from "../../src/index";


describe('jsonUtil', () => {
  describe('.recursivelyFilterPropertiesInPlace()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        const json = {a: 1}
        jsonUtil.recursivelyFilterPropertiesInPlace(json, ['a'])
        expect(json).to.eql({})
      })  
    })
  })

  describe('.recursivelyFilterPropertiesCopy()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        expect(jsonUtil.recursivelyFilterPropertiesCopy({ a: 1, b: 2, c: 3 }, ['a', 'b'])).to.eql({c: 3})
        expect(jsonUtil.recursivelyFilterPropertiesCopy({ a: { b: { bogus: true } } }, ['bogus'])).to.eql({ a: { b: {} } })

      })  
    })
  })
})