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

  describe('.convertHexToBase62', () => {
    describe('based on some common test inputs', () => {
      it('works as expected', () => {
        const uuidSansDashes = 'f0049da2-0960-4c9d-8bc1-a774567ec568'.replace(/-/g, '');
        expect(radixUtil.convertHexToBase62(uuidSansDashes)).to.eq('7IuGbjogtVbUYjlCejlrFQ')
        expect(radixUtil.convertHexToBase62('f0049da2-0960-4c9d-8bc1-a774567ec600'.replace(/-/g, ''))).to.eq('7IuGbjogtVbUYjlCejlrHs')
      })  
    })

    describe('when the input constains a dash', () => {
      it('throws', () => {
        expect(() => radixUtil.convertHexToBase62('1-2')).to.throw;
        expect(() => radixUtil.convertHexToBase62('f0049da2-0960-4c9d-8bc1-a774567ec568')).to.throw;
      })  
    })
  })
})