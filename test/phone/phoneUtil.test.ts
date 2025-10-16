import { expect } from 'chai';
import { normalizePhone } from '../../src/phone/phoneUtil';

describe('phoneUtil', () => {
  describe('normalizePhone', () => {
    describe('US phone numbers', () => {
      it('should normalize US phone with parentheses and spaces', () => {
        const result = normalizePhone('(415) 555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with dashes', () => {
        const result = normalizePhone('415-555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize 10-digit US phone without formatting', () => {
        const result = normalizePhone('4155552671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with country code and dashes', () => {
        const result = normalizePhone('+1-415-555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize 11-digit US phone with leading 1', () => {
        const result = normalizePhone('14155552671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with spaces', () => {
        const result = normalizePhone('415 555 2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with dots', () => {
        const result = normalizePhone('415.555.2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with mixed formatting', () => {
        const result = normalizePhone('(415) 555.2671');
        expect(result).to.equal('+14155552671');
      });

      it('should normalize US phone with brackets', () => {
        const result = normalizePhone('[415] 555-2671');
        expect(result).to.equal('+14155552671');
      });
    });

    describe('international phone numbers', () => {
      it('should normalize UK phone number', () => {
        const result = normalizePhone('+44 20 7183 8750');
        expect(result).to.equal('+442071838750');
      });

      it('should normalize French phone number', () => {
        const result = normalizePhone('+33 1 42 86 82 00');
        expect(result).to.equal('+33142868200');
      });

      it('should normalize German phone number', () => {
        const result = normalizePhone('+49 30 12345678');
        expect(result).to.equal('+493012345678');
      });

      it('should normalize Japanese phone number', () => {
        const result = normalizePhone('+81 3-1234-5678');
        expect(result).to.equal('+81312345678');
      });

      it('should normalize Australian phone number', () => {
        const result = normalizePhone('+61 2 1234 5678');
        expect(result).to.equal('+61212345678');
      });

      it('should normalize phone with plus and parentheses', () => {
        const result = normalizePhone('+1 (415) 555-2671');
        expect(result).to.equal('+14155552671');
      });
    });

    describe('edge cases and validation', () => {
      it('should throw error for empty string', () => {
        expect(() => normalizePhone('')).to.throw('Phone number cannot be empty');
      });

      it('should throw error for whitespace only', () => {
        expect(() => normalizePhone('   ')).to.throw('Phone number cannot be empty');
      });

      it('should throw error for phone number that is too short', () => {
        expect(() => normalizePhone('123456')).to.throw('Invalid phone number length');
      });

      it('should throw error for phone number that is too long', () => {
        expect(() => normalizePhone('12345678901234567890')).to.throw('Invalid phone number length');
      });

      it('should assume US country code for 10-digit numbers', () => {
        // 10-digit numbers are assumed to be US numbers
        const result = normalizePhone('2071838750');
        expect(result).to.equal('+12071838750');
      });

      it('should throw error for 11-digit number not starting with 1', () => {
        expect(() => normalizePhone('24155552671')).to.throw('Phone number must include country code');
      });

      it('should throw error for phone starting with 0', () => {
        expect(() => normalizePhone('+0123456789')).to.throw('Invalid E.164 format');
      });

      it('should handle phone with only special characters removed', () => {
        const result = normalizePhone('+1-415-555-2671');
        expect(result).to.equal('+14155552671');
      });
    });

    describe('minimum and maximum length validation', () => {
      it('should accept 7-digit number with country code', () => {
        const result = normalizePhone('+1234567');
        expect(result).to.equal('+1234567');
      });

      it('should accept 15-digit number (maximum)', () => {
        const result = normalizePhone('+123456789012345');
        expect(result).to.equal('+123456789012345');
      });

      it('should reject 6-digit number even with country code', () => {
        expect(() => normalizePhone('+123456')).to.throw('Invalid E.164 format');
      });

      it('should reject 16-digit number', () => {
        expect(() => normalizePhone('+1234567890123456')).to.throw('Invalid E.164 format');
      });
    });

    describe('various formatting characters', () => {
      it('should remove all dashes', () => {
        const result = normalizePhone('+1-415-555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should remove all spaces', () => {
        const result = normalizePhone('+1 415 555 2671');
        expect(result).to.equal('+14155552671');
      });

      it('should remove all parentheses', () => {
        const result = normalizePhone('+1(415)555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should remove all dots', () => {
        const result = normalizePhone('+1.415.555.2671');
        expect(result).to.equal('+14155552671');
      });

      it('should remove all brackets', () => {
        const result = normalizePhone('+1[415]555-2671');
        expect(result).to.equal('+14155552671');
      });

      it('should handle combination of all formatting characters', () => {
        const result = normalizePhone('+1 (415) 555-2671');
        expect(result).to.equal('+14155552671');
      });
    });

    describe('idempotency', () => {
      it('should be idempotent for already normalized numbers', () => {
        const phone = '(415) 555-2671';
        const normalized1 = normalizePhone(phone);
        const normalized2 = normalizePhone(normalized1);
        expect(normalized1).to.equal(normalized2);
        expect(normalized2).to.equal('+14155552671');
      });
    });

    describe('error messages', () => {
      it('should include original phone in error for missing country code', () => {
        try {
          normalizePhone('12345678'); // 8 digits - not 10, not 11
          expect.fail('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).to.include('12345678');
          expect(err.message).to.include('country code');
        }
      });

      it('should include original phone in error for invalid length', () => {
        try {
          normalizePhone('12345');
          expect.fail('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).to.include('12345');
          expect(err.message).to.include('length');
        }
      });

      it('should include normalized format in error for invalid E.164', () => {
        try {
          normalizePhone('+0123456789');
          expect.fail('Should have thrown an error');
        } catch (err: any) {
          expect(err.message).to.include('E.164');
          expect(err.message).to.include('+0123456789');
        }
      });
    });

    describe('real-world examples', () => {
      it('should handle common US mobile format', () => {
        const result = normalizePhone('(555) 123-4567');
        expect(result).to.equal('+15551234567');
      });

      it('should handle US toll-free number', () => {
        const result = normalizePhone('1-800-555-1234');
        expect(result).to.equal('+18005551234');
      });

      it('should handle international format from contact forms', () => {
        const result = normalizePhone('+44-20-7183-8750');
        expect(result).to.equal('+442071838750');
      });

      it('should handle copy-pasted format with extra spaces', () => {
        const result = normalizePhone('  +1  (415)  555-2671  ');
        expect(result).to.equal('+14155552671');
      });
    });

    describe('country-specific patterns', () => {
      it('should handle Mexico phone number', () => {
        const result = normalizePhone('+52 55 1234 5678');
        expect(result).to.equal('+525512345678');
      });

      it('should handle Brazil phone number', () => {
        const result = normalizePhone('+55 11 98765-4321');
        expect(result).to.equal('+5511987654321');
      });

      it('should handle China phone number', () => {
        const result = normalizePhone('+86 10 1234 5678');
        expect(result).to.equal('+861012345678');
      });

      it('should handle India phone number', () => {
        const result = normalizePhone('+91 22 1234 5678');
        expect(result).to.equal('+912212345678');
      });
    });
  });
});
