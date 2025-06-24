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
        expect(radixUtil.convertHexToBase62('4b6cdaf7-0a4c-4241-99c6-51f6712fa551'.replace(/-/g, ''))).to.eq('2IKAdR7BuJ8yMvYctR3f1t')
      })  
    })

    describe('when the input constains a dash', () => {
      it('throws', () => {
        expect(() => radixUtil.convertHexToBase62('1-2')).to.throw;
        expect(() => radixUtil.convertHexToBase62('f0049da2-0960-4c9d-8bc1-a774567ec568')).to.throw;
      })  
    })
  })

  describe('.convertHexToNanoIdAlphabet', () => {
    describe('based on some common test inputs', () => {
      it('works as expected', () => {
        const uuidSansDashes = 'f0049da2-0960-4c9d-8bc1-a774567ec568'.replace(/-/g, '');
        expect(radixUtil.convertHexToNanoIdAlphabet(uuidSansDashes)).to.eq('3l19rY2M1CcOk1esHMVhLd')
        expect(radixUtil.convertHexToNanoIdAlphabet('f0049da2-0960-4c9d-8bc1-a774567ec600'.replace(/-/g, ''))).to.eq('3l19rY2M1CcOk1esHMVhO0')
        expect(radixUtil.convertHexToNanoIdAlphabet('954e2bff-12ab-4f03-b6ab-e73dbe7ec712'.replace(/-/g, ''))).to.eq('2LJYk-4fiF0wQguorzVhSI')
        expect(radixUtil.convertHexToNanoIdAlphabet('4b6cdaf7-0a4c-4241-99c6-51f6712fa551'.replace(/-/g, ''))).to.eq('1BRDgs2_m2GPc6KVPmBvLH')
        expect(radixUtil.convertHexToNanoIdAlphabet('00000000-0000-0000-0000-000000000000'.replace(/-/g, ''))).to.eq('0')
        expect(radixUtil.convertHexToNanoIdAlphabet('00000000-0000-0000-0000-000000000001'.replace(/-/g, ''))).to.eq('1')
        expect(radixUtil.convertHexToNanoIdAlphabet('20000000-0000-0000-0000-000000000003'.replace(/-/g, ''))).to.eq('W00000000000000000003')
        expect(radixUtil.convertHexToNanoIdAlphabet('20000000-0000-0000-0000-000000000009'.replace(/-/g, ''))).to.eq('W00000000000000000009')
        expect(radixUtil.convertHexToNanoIdAlphabet('20000000-0000-0000-1234-123456789012'.replace(/-/g, ''))).to.eq('W00000000018p4ZHMU90I')

      })  
    })

    describe('when the input constains a dash', () => {
      it('throws', () => {
        expect(() => radixUtil.convertHexToNanoIdAlphabet('1-2')).to.throw;
        expect(() => radixUtil.convertHexToNanoIdAlphabet('f0049da2-0960-4c9d-8bc1-a774567ec568')).to.throw;
      })  
    })
  })
})