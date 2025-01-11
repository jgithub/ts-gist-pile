import { expect } from 'chai';
import { functionUtil } from "../../src/index";


describe('functionUtil', () => {
  describe('.tryFn()', () => {
    describe('when passed a function', () => {
      it('uses executes that function but swallows any exceptions', () => {
        expect(functionUtil.tryFn(() => 1)).to.eql(1)
      })
      it('uses executes that function but swallows any exceptions', () => {
        expect(functionUtil.tryFn(() => { throw new Error() })).to.be.undefined
      })
    })
  })
})