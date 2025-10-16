import { expect } from 'chai';
import { ImmutableUtc } from '../../src/date/ImmutableUtc';
import type { ImmutableUtc as ImmutableUtcType } from '../../src/date/ImmutableUtc';

describe('ImmutableUtc', () => {
  describe('fromDate', () => {
    it('should create an ImmutableUtc from a Date', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal('2024-01-15T10:30:00.000Z');
      expect(typeof result).to.equal('string');
    });

    it('should handle dates with milliseconds', () => {
      const date = new Date('2024-01-15T10:30:00.123Z');
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal('2024-01-15T10:30:00.123Z');
    });

    it('should throw error for invalid Date', () => {
      const invalidDate = new Date('invalid');
      expect(() => ImmutableUtc.fromDate(invalidDate)).to.throw('invalid Date');
    });

    it('should throw error for non-Date input', () => {
      expect(() => ImmutableUtc.fromDate('not a date' as any)).to.throw('requires a Date object');
      expect(() => ImmutableUtc.fromDate(123 as any)).to.throw('requires a Date object');
      expect(() => ImmutableUtc.fromDate(null as any)).to.throw('requires a Date object');
    });

    it('should handle epoch time (1970-01-01)', () => {
      const date = new Date(0);
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal('1970-01-01T00:00:00.000Z');
    });

    it('should handle dates in the far past', () => {
      const date = new Date('1900-01-01T00:00:00.000Z');
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal('1900-01-01T00:00:00.000Z');
    });

    it('should handle dates in the far future', () => {
      const date = new Date('2100-12-31T23:59:59.999Z');
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal('2100-12-31T23:59:59.999Z');
    });
  });

  describe('now', () => {
    it('should create an ImmutableUtc for the current time', () => {
      const before = Date.now();
      const result = ImmutableUtc.now();
      const after = Date.now();

      const resultMillis = ImmutableUtc.toMillis(result);
      expect(resultMillis).to.be.at.least(before);
      expect(resultMillis).to.be.at.most(after);
    });

    it('should return a valid ISO 8601 string', () => {
      const result = ImmutableUtc.now();
      expect(result).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should create different timestamps when called multiple times', (done) => {
      const first = ImmutableUtc.now();
      setTimeout(() => {
        const second = ImmutableUtc.now();
        expect(second).to.not.equal(first);
        expect(ImmutableUtc.compare(second, first)).to.be.greaterThan(0);
        done();
      }, 5);
    });
  });

  describe('parse', () => {
    it('should parse a valid ISO 8601 string to Date', () => {
      const result = ImmutableUtc.parse('2024-01-15T10:30:00.000Z');

      expect(result).to.be.instanceOf(Date);
      expect(result.toISOString()).to.equal('2024-01-15T10:30:00.000Z');
    });

    it('should parse ISO string with milliseconds', () => {
      const result = ImmutableUtc.parse('2024-01-15T10:30:00.123Z');

      expect(result.getTime()).to.equal(new Date('2024-01-15T10:30:00.123Z').getTime());
    });

    it('should throw error for invalid date string', () => {
      expect(() => ImmutableUtc.parse('not-a-date')).to.throw('invalid date string');
      expect(() => ImmutableUtc.parse('2024-13-01')).to.throw('invalid date string');
    });

    it('should throw error for non-string input', () => {
      expect(() => ImmutableUtc.parse(123 as any)).to.throw('requires a string');
      expect(() => ImmutableUtc.parse(null as any)).to.throw('requires a string');
      expect(() => ImmutableUtc.parse(undefined as any)).to.throw('requires a string');
    });

    it('should handle epoch time string', () => {
      const result = ImmutableUtc.parse('1970-01-01T00:00:00.000Z');
      expect(result.getTime()).to.equal(0);
    });
  });

  describe('toDate', () => {
    it('should convert ImmutableUtc to Date', () => {
      const immutable: ImmutableUtcType = '2024-01-15T10:30:00.000Z' as ImmutableUtcType;
      const result = ImmutableUtc.toDate(immutable);

      expect(result).to.be.instanceOf(Date);
      expect(result.toISOString()).to.equal('2024-01-15T10:30:00.000Z');
    });

    it('should work with ImmutableUtc created via fromDate', () => {
      const original = new Date('2024-06-15T14:20:30.456Z');
      const immutable = ImmutableUtc.fromDate(original);
      const result = ImmutableUtc.toDate(immutable);

      expect(result.getTime()).to.equal(original.getTime());
    });

    it('should throw error for invalid ImmutableUtc', () => {
      const invalid = 'not-a-date' as ImmutableUtcType;
      expect(() => ImmutableUtc.toDate(invalid)).to.throw('invalid date string');
    });
  });

  describe('fromMillis', () => {
    it('should create ImmutableUtc from Unix timestamp', () => {
      const millis = new Date('2024-01-15T10:30:00.000Z').getTime();
      const result = ImmutableUtc.fromMillis(millis);

      expect(result).to.equal('2024-01-15T10:30:00.000Z');
    });

    it('should handle epoch time (0)', () => {
      const result = ImmutableUtc.fromMillis(0);
      expect(result).to.equal('1970-01-01T00:00:00.000Z');
    });

    it('should handle negative timestamps (before epoch)', () => {
      const result = ImmutableUtc.fromMillis(-86400000); // 1 day before epoch
      expect(result).to.equal('1969-12-31T00:00:00.000Z');
    });

    it('should throw error for invalid number', () => {
      expect(() => ImmutableUtc.fromMillis(NaN)).to.throw('valid number');
      expect(() => ImmutableUtc.fromMillis('123' as any)).to.throw('valid number');
    });

    it('should handle very large timestamps', () => {
      const millis = new Date('2100-01-01T00:00:00.000Z').getTime();
      const result = ImmutableUtc.fromMillis(millis);
      expect(ImmutableUtc.toMillis(result)).to.equal(millis);
    });
  });

  describe('toMillis', () => {
    it('should convert ImmutableUtc to Unix timestamp', () => {
      const immutable = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.000Z'));
      const result = ImmutableUtc.toMillis(immutable);

      expect(result).to.equal(new Date('2024-01-15T10:30:00.000Z').getTime());
    });

    it('should handle epoch time', () => {
      const immutable: ImmutableUtcType = '1970-01-01T00:00:00.000Z' as ImmutableUtcType;
      const result = ImmutableUtc.toMillis(immutable);

      expect(result).to.equal(0);
    });

    it('should be inverse of fromMillis', () => {
      const original = 1705318200000;
      const immutable = ImmutableUtc.fromMillis(original);
      const result = ImmutableUtc.toMillis(immutable);

      expect(result).to.equal(original);
    });
  });

  describe('fromSeconds', () => {
    it('should create ImmutableUtc from Unix timestamp in seconds', () => {
      const seconds = Math.floor(new Date('2024-01-15T10:30:00.000Z').getTime() / 1000);
      const result = ImmutableUtc.fromSeconds(seconds);

      expect(result).to.equal('2024-01-15T10:30:00.000Z');
    });

    it('should handle epoch time (0)', () => {
      const result = ImmutableUtc.fromSeconds(0);
      expect(result).to.equal('1970-01-01T00:00:00.000Z');
    });

    it('should handle negative timestamps (before epoch)', () => {
      const result = ImmutableUtc.fromSeconds(-86400); // 1 day before epoch
      expect(result).to.equal('1969-12-31T00:00:00.000Z');
    });

    it('should throw error for invalid number', () => {
      expect(() => ImmutableUtc.fromSeconds(NaN)).to.throw('valid number');
      expect(() => ImmutableUtc.fromSeconds('123' as any)).to.throw('valid number');
    });

    it('should handle fractional seconds by multiplying by 1000', () => {
      const seconds = 1705318200.456; // With fractional part
      const result = ImmutableUtc.fromSeconds(seconds);
      const millis = ImmutableUtc.toMillis(result);

      expect(millis).to.equal(1705318200456);
    });

    it('should handle very large timestamps', () => {
      const seconds = Math.floor(new Date('2100-01-01T00:00:00.000Z').getTime() / 1000);
      const result = ImmutableUtc.fromSeconds(seconds);
      expect(ImmutableUtc.toSeconds(result)).to.equal(seconds);
    });
  });

  describe('toSeconds', () => {
    it('should convert ImmutableUtc to Unix timestamp in seconds', () => {
      const immutable = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.000Z'));
      const result = ImmutableUtc.toSeconds(immutable);

      const expected = Math.floor(new Date('2024-01-15T10:30:00.000Z').getTime() / 1000);
      expect(result).to.equal(expected);
    });

    it('should handle epoch time', () => {
      const immutable: ImmutableUtcType = '1970-01-01T00:00:00.000Z' as ImmutableUtcType;
      const result = ImmutableUtc.toSeconds(immutable);

      expect(result).to.equal(0);
    });

    it('should truncate milliseconds', () => {
      const immutable = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.999Z'));
      const result = ImmutableUtc.toSeconds(immutable);

      const expected = Math.floor(new Date('2024-01-15T10:30:00.999Z').getTime() / 1000);
      expect(result).to.equal(expected);

      // Should be same second as a timestamp without milliseconds
      const withoutMillis = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.000Z'));
      expect(result).to.equal(ImmutableUtc.toSeconds(withoutMillis));
    });

    it('should be inverse of fromSeconds', () => {
      const original = 1705318200;
      const immutable = ImmutableUtc.fromSeconds(original);
      const result = ImmutableUtc.toSeconds(immutable);

      expect(result).to.equal(original);
    });

    it('should return integer values only', () => {
      const immutable = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.456Z'));
      const result = ImmutableUtc.toSeconds(immutable);

      expect(Number.isInteger(result)).to.be.true;
      expect(result).to.equal(Math.floor(result));
    });
  });

  describe('isValid', () => {
    it('should return true for valid ISO 8601 strings', () => {
      expect(ImmutableUtc.isValid('2024-01-15T10:30:00.000Z')).to.be.true;
      expect(ImmutableUtc.isValid('1970-01-01T00:00:00.000Z')).to.be.true;
      expect(ImmutableUtc.isValid('2100-12-31T23:59:59.999Z')).to.be.true;
    });

    it('should return false for invalid date strings', () => {
      expect(ImmutableUtc.isValid('not-a-date')).to.be.false;
      expect(ImmutableUtc.isValid('2024-13-01T00:00:00.000Z')).to.be.false;
      expect(ImmutableUtc.isValid('2024-01-32T00:00:00.000Z')).to.be.false;
    });

    it('should return false for non-string values', () => {
      expect(ImmutableUtc.isValid(123)).to.be.false;
      expect(ImmutableUtc.isValid(null)).to.be.false;
      expect(ImmutableUtc.isValid(undefined)).to.be.false;
      expect(ImmutableUtc.isValid({})).to.be.false;
      expect(ImmutableUtc.isValid(new Date())).to.be.false;
    });

    it('should return false for date strings not in ISO format', () => {
      expect(ImmutableUtc.isValid('2024-01-15')).to.be.false;
      expect(ImmutableUtc.isValid('01/15/2024')).to.be.false;
      expect(ImmutableUtc.isValid('Mon Jan 15 2024')).to.be.false;
    });

    it('should require exact ISO 8601 format with Z', () => {
      // Without milliseconds
      expect(ImmutableUtc.isValid('2024-01-15T10:30:00Z')).to.be.false;
      // With timezone offset instead of Z
      expect(ImmutableUtc.isValid('2024-01-15T10:30:00.000+00:00')).to.be.false;
    });
  });

  describe('compare', () => {
    it('should return negative when first is earlier', () => {
      const earlier = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.000Z'));
      const later = ImmutableUtc.fromDate(new Date('2024-12-31T23:59:59.999Z'));

      expect(ImmutableUtc.compare(earlier, later)).to.be.lessThan(0);
    });

    it('should return positive when first is later', () => {
      const earlier = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.000Z'));
      const later = ImmutableUtc.fromDate(new Date('2024-12-31T23:59:59.999Z'));

      expect(ImmutableUtc.compare(later, earlier)).to.be.greaterThan(0);
    });

    it('should return zero when timestamps are equal', () => {
      const date = new Date('2024-06-15T12:00:00.000Z');
      const first = ImmutableUtc.fromDate(date);
      const second = ImmutableUtc.fromDate(date);

      expect(ImmutableUtc.compare(first, second)).to.equal(0);
    });

    it('should handle millisecond differences', () => {
      const first = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.000Z'));
      const second = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.001Z'));

      expect(ImmutableUtc.compare(first, second)).to.be.lessThan(0);
    });
  });

  describe('min', () => {
    it('should return the earlier timestamp', () => {
      const earlier = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.000Z'));
      const later = ImmutableUtc.fromDate(new Date('2024-12-31T23:59:59.999Z'));

      expect(ImmutableUtc.min(earlier, later)).to.equal(earlier);
      expect(ImmutableUtc.min(later, earlier)).to.equal(earlier);
    });

    it('should return first when timestamps are equal', () => {
      const date = new Date('2024-06-15T12:00:00.000Z');
      const first = ImmutableUtc.fromDate(date);
      const second = ImmutableUtc.fromDate(date);

      expect(ImmutableUtc.min(first, second)).to.equal(first);
    });
  });

  describe('max', () => {
    it('should return the later timestamp', () => {
      const earlier = ImmutableUtc.fromDate(new Date('2024-01-01T00:00:00.000Z'));
      const later = ImmutableUtc.fromDate(new Date('2024-12-31T23:59:59.999Z'));

      expect(ImmutableUtc.max(earlier, later)).to.equal(later);
      expect(ImmutableUtc.max(later, earlier)).to.equal(later);
    });

    it('should return first when timestamps are equal', () => {
      const date = new Date('2024-06-15T12:00:00.000Z');
      const first = ImmutableUtc.fromDate(date);
      const second = ImmutableUtc.fromDate(date);

      expect(ImmutableUtc.max(first, second)).to.equal(first);
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain value through Date -> ImmutableUtc -> Date', () => {
      const original = new Date('2024-06-15T14:20:30.456Z');
      const immutable = ImmutableUtc.fromDate(original);
      const result = ImmutableUtc.toDate(immutable);

      expect(result.getTime()).to.equal(original.getTime());
    });

    it('should maintain value through millis -> ImmutableUtc -> millis', () => {
      const original = 1718463630456;
      const immutable = ImmutableUtc.fromMillis(original);
      const result = ImmutableUtc.toMillis(immutable);

      expect(result).to.equal(original);
    });

    it('should maintain value through ImmutableUtc -> Date -> ImmutableUtc', () => {
      const original = ImmutableUtc.now();
      const date = ImmutableUtc.toDate(original);
      const result = ImmutableUtc.fromDate(date);

      expect(result).to.equal(original);
    });
  });

  describe('immutability', () => {
    it('should not be affected by mutating the source Date', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const immutable = ImmutableUtc.fromDate(date);

      // Mutate the original date
      date.setFullYear(2025);

      // ImmutableUtc should be unchanged
      expect(immutable).to.equal('2024-01-15T10:30:00.000Z');
    });

    it('should not be affected by mutating a converted Date', () => {
      const immutable = ImmutableUtc.fromDate(new Date('2024-01-15T10:30:00.000Z'));
      const date = ImmutableUtc.toDate(immutable);

      // Mutate the converted date
      date.setFullYear(2025);

      // ImmutableUtc should be unchanged
      expect(immutable).to.equal('2024-01-15T10:30:00.000Z');

      // Converting again should give original value
      const date2 = ImmutableUtc.toDate(immutable);
      expect(date2.toISOString()).to.equal('2024-01-15T10:30:00.000Z');
    });
  });

  describe('type safety', () => {
    it('should be a branded type (compile-time check)', () => {
      const immutable: ImmutableUtcType = ImmutableUtc.now();
      const plainString: string = immutable; // Should work - ImmutableUtc is still a string

      // This would fail at compile time (but we can't test that at runtime):
      // const wrongType: ImmutableUtcType = 'not-branded'; // TypeScript error
    });

    it('should work with type guards', () => {
      const value: any = '2024-01-15T10:30:00.000Z';

      if (ImmutableUtc.isValid(value)) {
        // TypeScript should infer value as ImmutableUtcType here
        const date = ImmutableUtc.toDate(value);
        expect(date).to.be.instanceOf(Date);
      }
    });
  });
});
