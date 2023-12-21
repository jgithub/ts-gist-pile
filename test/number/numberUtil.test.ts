import { expect } from 'chai';
import { numberUtil } from "../../src/index";


describe('numberUtil', () => {
  describe('.tryAsNumber()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        
        expect(numberUtil.tryAsNumber(null)).to.be.undefined
        expect(numberUtil.tryAsNumber(undefined)).to.be.undefined
        expect(numberUtil.tryAsNumber("")).to.be.undefined
        expect(numberUtil.tryAsNumber("hello")).to.be.undefined
        expect(numberUtil.tryAsNumber("11")).to.eq(11)
        expect(numberUtil.tryAsNumber(" 11 ")).to.eq(11)
        expect(numberUtil.tryAsNumber(11)).to.eq(11)
        expect(numberUtil.tryAsNumber(11.0)).to.eq(11)
      })  
    })
  })
})