import { expect } from 'chai';
import { isTruelike } from '../../src/boolean/booleanUtil';

describe('booleanUtil', () => {
  describe('.isTruelike()', () => {
    describe('with boolean inputs', () => {
      it('returns true for true', () => {
        expect(isTruelike(true)).to.be.true;
      });

      it('returns false for false', () => {
        expect(isTruelike(false)).to.be.false;
      });
    });

    describe('with string inputs (truthy)', () => {
      it('returns true for "true"', () => {
        expect(isTruelike('true')).to.be.true;
      });

      it('returns true for "TRUE" (case insensitive)', () => {
        expect(isTruelike('TRUE')).to.be.true;
      });

      it('returns true for "yes"', () => {
        expect(isTruelike('yes')).to.be.true;
      });

      it('returns true for "YES" (case insensitive)', () => {
        expect(isTruelike('YES')).to.be.true;
      });

      it('returns true for "t"', () => {
        expect(isTruelike('t')).to.be.true;
      });

      it('returns true for "T"', () => {
        expect(isTruelike('T')).to.be.true;
      });

      it('returns true for "y"', () => {
        expect(isTruelike('y')).to.be.true;
      });

      it('returns true for "Y"', () => {
        expect(isTruelike('Y')).to.be.true;
      });

      it('returns true for "1"', () => {
        expect(isTruelike('1')).to.be.true;
      });

      it('returns true for " true " (with whitespace)', () => {
        expect(isTruelike(' true ')).to.be.true;
      });

      it('returns true for "  YES  " (with whitespace)', () => {
        expect(isTruelike('  YES  ')).to.be.true;
      });
    });

    describe('with string inputs (falsy)', () => {
      it('returns false for "false"', () => {
        expect(isTruelike('false')).to.be.false;
      });

      it('returns false for "no"', () => {
        expect(isTruelike('no')).to.be.false;
      });

      it('returns false for "0"', () => {
        expect(isTruelike('0')).to.be.false;
      });

      it('returns false for empty string', () => {
        expect(isTruelike('')).to.be.false;
      });

      it('returns false for random string', () => {
        expect(isTruelike('random')).to.be.false;
      });
    });

    describe('with number inputs', () => {
      it('returns true for 1', () => {
        expect(isTruelike(1)).to.be.true;
      });

      it('returns false for 0', () => {
        expect(isTruelike(0)).to.be.false;
      });

      it('returns false for 2', () => {
        expect(isTruelike(2)).to.be.false;
      });

      it('returns false for -1', () => {
        expect(isTruelike(-1)).to.be.false;
      });
    });

    describe('with null and undefined', () => {
      it('returns false for null', () => {
        expect(isTruelike(null)).to.be.false;
      });

      it('returns false for undefined', () => {
        expect(isTruelike(undefined)).to.be.false;
      });
    });
  });
});
