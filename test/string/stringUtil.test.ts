import { expect } from 'chai';
import { DateProviderService, stringUtil } from "../../src/index";


describe('stringUtil', () => {
  describe('.isWellFormedCanonicalUuid()', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        
        expect(stringUtil.isWellFormedCanonicalUuid(null as unknown as string)).to.be.false
        expect(stringUtil.isWellFormedCanonicalUuid(undefined as unknown as string)).to.be.false
        expect(stringUtil.isWellFormedCanonicalUuid("")).to.be.false
        expect(stringUtil.isWellFormedCanonicalUuid("00000000-0000-0000-0000-000000000000")).to.be.true
        expect(stringUtil.isWellFormedCanonicalUuid("00000000-0000-0000-0000-000000000000  ")).to.be.false
        expect(stringUtil.isWellFormedCanonicalUuid("adc65be3-ef1f-4c06-a248-52247a1602d6")).to.be.true
        expect(stringUtil.isWellFormedCanonicalUuid("Adc65be3-ef1f-4c06-a248-52247a1602d6")).to.be.true
        expect(stringUtil.isWellFormedCanonicalUuid("gdc65be3-ef1f-4c06-a248-52247a1602d6")).to.be.false
      })  
    })
  })
})