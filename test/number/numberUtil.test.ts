import { expect } from 'chai';
import { numberUtil } from "../../src/index";


describe('numberUtil', () => {
  describe('.tryAsNumber()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        expect(numberUtil.tryAsNumber(null)).to.be.null
        expect(numberUtil.tryAsNumber(undefined)).to.be.undefined
        expect(numberUtil.tryAsNumber("")).to.be.undefined
        expect(numberUtil.tryAsNumber("hello")).to.be.undefined
        expect(numberUtil.tryAsNumber("11")).to.eq(11)
        expect(numberUtil.tryAsNumber(" 11 ")).to.eq(11)
        expect(numberUtil.tryAsNumber(11)).to.eq(11)
        expect(numberUtil.tryAsNumber(11.0)).to.eq(11)
        expect(numberUtil.tryAsNumber(false as any)).to.be.undefined
      })  
    })
  })

  describe('.ensureNumber()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        expect(() => numberUtil.ensureNumber(null as any)).to.throw;
        expect(() => numberUtil.ensureNumber(undefined as any)).to.throw
        expect(() => numberUtil.ensureNumber("")).to.throw
        expect(() => numberUtil.ensureNumber("hello")).to.throw
        expect(numberUtil.ensureNumber("11")).to.eq(11)
        expect(numberUtil.ensureNumber(" 11 ")).to.eq(11)
        expect(numberUtil.ensureNumber(11)).to.eq(11)
        expect(numberUtil.ensureNumber(11.0)).to.eq(11)
        expect(numberUtil.ensureNumber(11.0)).to.eq(11.0)
        expect(() => numberUtil.ensureNumber(false as any)).to.throw
      })  
    })
  })  
})