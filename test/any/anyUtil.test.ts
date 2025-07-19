import { expect } from 'chai';
import { anyUtil } from "../../src/index";

describe('anyUtil', () => {
  describe('.hasValue()', () => {
    describe('when input has a value', () => {
      it('returns true for non-null and non-undefined values', () => {
        expect(anyUtil.hasValue(0)).to.be.true;
        expect(anyUtil.hasValue(false)).to.be.true;
        expect(anyUtil.hasValue("")).to.be.true;
        expect(anyUtil.hasValue("hello")).to.be.true;
        expect(anyUtil.hasValue([])).to.be.true;
        expect(anyUtil.hasValue({})).to.be.true;
        expect(anyUtil.hasValue(NaN)).to.be.true;
        expect(anyUtil.hasValue(Infinity)).to.be.true;
        expect(anyUtil.hasValue(-Infinity)).to.be.true;
      });
    });

    describe('when input does not have a value', () => {
      it('returns false for null and undefined values', () => {
        expect(anyUtil.hasValue(null)).to.be.false;
        expect(anyUtil.hasValue(undefined)).to.be.false;
      });
    });
  });

  describe('.isNullish()', () => {
    describe('when input is nullish', () => {
      it('returns true for null and undefined values', () => {
        expect(anyUtil.isNullish(null)).to.be.true;
        expect(anyUtil.isNullish(undefined)).to.be.true;
      });
    });

    describe('when input is not nullish', () => {
      it('returns false for non-null and non-undefined values', () => {
        expect(anyUtil.isNullish(0)).to.be.false;
        expect(anyUtil.isNullish(false)).to.be.false;
        expect(anyUtil.isNullish("")).to.be.false;
        expect(anyUtil.isNullish("hello")).to.be.false;
        expect(anyUtil.isNullish([])).to.be.false;
        expect(anyUtil.isNullish({})).to.be.false;
        expect(anyUtil.isNullish(NaN)).to.be.false;
        expect(anyUtil.isNullish(Infinity)).to.be.false;
        expect(anyUtil.isNullish(-Infinity)).to.be.false;
      });
    });
  });
});