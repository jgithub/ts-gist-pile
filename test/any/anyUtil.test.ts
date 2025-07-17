import { expect } from 'chai';
import { anyUtil } from "../../src/index";

describe('anyUtil', () => {
  describe('.isDefined()', () => {
    describe('when input is defined', () => {
      it('returns true for non-null and non-undefined values', () => {
        expect(anyUtil.isDefined(0)).to.be.true;
        expect(anyUtil.isDefined(false)).to.be.true;
        expect(anyUtil.isDefined("")).to.be.true;
        expect(anyUtil.isDefined("hello")).to.be.true;
        expect(anyUtil.isDefined([])).to.be.true;
        expect(anyUtil.isDefined({})).to.be.true;
        expect(anyUtil.isDefined(NaN)).to.be.true;
        expect(anyUtil.isDefined(Infinity)).to.be.true;
        expect(anyUtil.isDefined(-Infinity)).to.be.true;
      });
    });

    describe('when input is not defined', () => {
      it('returns false for null and undefined values', () => {
        expect(anyUtil.isDefined(null)).to.be.false;
        expect(anyUtil.isDefined(undefined)).to.be.false;
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