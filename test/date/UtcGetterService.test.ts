import { expect } from 'chai';
import { DateProviderService, UtcGetterService, UtcGetterServiceImpl } from "../../src/index";


describe('UtcGetterService', () => {
  describe('#getYyyyMmDdStringAtUtc()', () => {
    describe('on a sunny day', () => {
      it('generates the expected result', () => {
        const dateProviderService: DateProviderService = {
          getNow: () => {
            return new Date(1703364735143)
          }
        }
        expect(dateProviderService.getNow().toISOString()).to.eql("2023-12-23T20:52:15.143Z")
        expect(dateProviderService.getNow().toString()).to.eql("Sat Dec 23 2023 14:52:15 GMT-0600 (Central Standard Time)")
        const utcGetterService: UtcGetterService = new UtcGetterServiceImpl(dateProviderService)
        expect(utcGetterService.getYyyyMmDdStringAtUtc()).to.eq('20231223')
      })  
    })

    describe('when its 2024 in London but still 2023 in Chicago', () => {
      it('generates the expected result', () => {
        const dateProviderService: DateProviderService = {
          getNow: () => {
            return new Date(1704088799999)
          }
        }
        expect(dateProviderService.getNow().toISOString()).to.eql("2024-01-01T05:59:59.999Z")
        expect(dateProviderService.getNow().toString()).to.eql("Sun Dec 31 2023 23:59:59 GMT-0600 (Central Standard Time)")
        const utcGetterService: UtcGetterService = new UtcGetterServiceImpl(dateProviderService)
        expect(utcGetterService.getYyyyMmDdStringAtUtc()).to.eq('20240101')
      })  
    })
  })
})