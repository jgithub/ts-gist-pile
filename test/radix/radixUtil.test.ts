import { expect } from 'chai';
import { radixUtil } from "../../src/index";


describe('radixUtil', () => {
  describe('Base62 encoding and decoding', () => {
    describe('based on some common test inputs', () => {
      it('returns the expected result', () => {
        expect(radixUtil.encodeNumberAsBase62(123456789)).to.eq('8M0kX')
        expect(radixUtil.decodeBase62ToNumber('8M0kX')).to.eq(123456789)
        expect(radixUtil.encodeNumberAsBase62(0)).to.eq('0')
      })  
    })
  })  
})