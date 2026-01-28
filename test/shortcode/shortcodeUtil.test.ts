import { expect } from 'chai';
import { shortcodeUtil } from "../../src/index";

const { ALPHABET_58, ALPHABET_56, generateShortCode58, generateShortCode56, normalizeShortCode58, calculateCombinations } = shortcodeUtil;

describe('shortcodeUtil', () => {

  describe('ALPHABET_58', () => {
    it('has exactly 58 characters', () => {
      expect(ALPHABET_58.length).to.equal(58);
    });

    it('contains digits 0-9', () => {
      for (let i = 0; i <= 9; i++) {
        expect(ALPHABET_58).to.include(i.toString());
      }
    });

    it('excludes confusable uppercase letters O and I', () => {
      expect(ALPHABET_58).to.not.include('O');
      expect(ALPHABET_58).to.not.include('I');
    });

    it('excludes confusable lowercase letters o and l', () => {
      expect(ALPHABET_58).to.not.include('o');
      expect(ALPHABET_58).to.not.include('l');
    });

    it('contains all other uppercase letters A-Z except O and I', () => {
      const expectedUppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 24 letters (26 - O - I)
      for (const char of expectedUppercase) {
        expect(ALPHABET_58).to.include(char);
      }
    });

    it('contains all other lowercase letters a-z except o and l', () => {
      const expectedLowercase = 'abcdefghjkmnpqrstuvwxyz'; // 24 letters (26 - o - l)
      for (const char of expectedLowercase) {
        expect(ALPHABET_58).to.include(char);
      }
    });
  });

  describe('ALPHABET_56', () => {
    it('has exactly 56 characters', () => {
      expect(ALPHABET_56.length).to.equal(56);
    });

    it('excludes digits 0 and 1', () => {
      expect(ALPHABET_56).to.not.include('0');
      expect(ALPHABET_56).to.not.include('1');
    });

    it('contains digits 2-9', () => {
      for (let i = 2; i <= 9; i++) {
        expect(ALPHABET_56).to.include(i.toString());
      }
    });

    it('excludes all six confusable characters (0, 1, O, o, l, I)', () => {
      expect(ALPHABET_56).to.not.include('0');
      expect(ALPHABET_56).to.not.include('1');
      expect(ALPHABET_56).to.not.include('O');
      expect(ALPHABET_56).to.not.include('o');
      expect(ALPHABET_56).to.not.include('l');
      expect(ALPHABET_56).to.not.include('I');
    });
  });

  describe('.generateShortCode58()', () => {
    it('returns a string of default length 8', () => {
      const code = generateShortCode58();
      expect(code).to.be.a('string');
      expect(code.length).to.equal(8);
    });

    it('returns a string of specified length', () => {
      expect(generateShortCode58(4).length).to.equal(4);
      expect(generateShortCode58(12).length).to.equal(12);
      expect(generateShortCode58(1).length).to.equal(1);
    });

    it('only uses characters from ALPHABET_58', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode58();
        for (const char of code) {
          expect(ALPHABET_58).to.include(char);
        }
      }
    });

    it('never generates confusable characters O, o, l, or I', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode58();
        expect(code).to.not.include('O');
        expect(code).to.not.include('o');
        expect(code).to.not.include('l');
        expect(code).to.not.include('I');
      }
    });

    it('generates different codes on successive calls (randomness check)', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode58());
      }
      // With 58^8 combinations, 100 codes should all be unique
      expect(codes.size).to.equal(100);
    });

    it('distributes characters reasonably across the alphabet', () => {
      const charCounts: Record<string, number> = {};
      const iterations = 10000;
      const codeLength = 8;

      for (let i = 0; i < iterations; i++) {
        const code = generateShortCode58();
        for (const char of code) {
          charCounts[char] = (charCounts[char] || 0) + 1;
        }
      }

      const totalChars = iterations * codeLength;
      const expectedPerChar = totalChars / ALPHABET_58.length;
      const tolerance = 0.3; // 30% tolerance

      for (const char of ALPHABET_58) {
        const count = charCounts[char] || 0;
        expect(count).to.be.greaterThan(expectedPerChar * (1 - tolerance));
        expect(count).to.be.lessThan(expectedPerChar * (1 + tolerance));
      }
    });
  });

  describe('.generateShortCode56()', () => {
    it('returns a string of default length 8', () => {
      const code = generateShortCode56();
      expect(code).to.be.a('string');
      expect(code.length).to.equal(8);
    });

    it('returns a string of specified length', () => {
      expect(generateShortCode56(4).length).to.equal(4);
      expect(generateShortCode56(12).length).to.equal(12);
      expect(generateShortCode56(1).length).to.equal(1);
    });

    it('only uses characters from ALPHABET_56', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode56();
        for (const char of code) {
          expect(ALPHABET_56).to.include(char);
        }
      }
    });

    it('never generates any of the six confusable characters', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode56();
        expect(code).to.not.include('0');
        expect(code).to.not.include('1');
        expect(code).to.not.include('O');
        expect(code).to.not.include('o');
        expect(code).to.not.include('l');
        expect(code).to.not.include('I');
      }
    });

    it('generates different codes on successive calls (randomness check)', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode56());
      }
      expect(codes.size).to.equal(100);
    });

    it('distributes characters reasonably across the alphabet', () => {
      const charCounts: Record<string, number> = {};
      const iterations = 10000;
      const codeLength = 8;

      for (let i = 0; i < iterations; i++) {
        const code = generateShortCode56();
        for (const char of code) {
          charCounts[char] = (charCounts[char] || 0) + 1;
        }
      }

      const totalChars = iterations * codeLength;
      const expectedPerChar = totalChars / ALPHABET_56.length;
      const tolerance = 0.3;

      for (const char of ALPHABET_56) {
        const count = charCounts[char] || 0;
        expect(count).to.be.greaterThan(expectedPerChar * (1 - tolerance));
        expect(count).to.be.lessThan(expectedPerChar * (1 + tolerance));
      }
    });
  });

  describe('.normalizeShortCode58()', () => {
    it('converts uppercase O to 0', () => {
      expect(normalizeShortCode58('O')).to.equal('0');
      expect(normalizeShortCode58('OOO')).to.equal('000');
    });

    it('converts lowercase o to 0', () => {
      expect(normalizeShortCode58('o')).to.equal('0');
      expect(normalizeShortCode58('ooo')).to.equal('000');
    });

    it('converts lowercase l to 1', () => {
      expect(normalizeShortCode58('l')).to.equal('1');
      expect(normalizeShortCode58('lll')).to.equal('111');
    });

    it('converts uppercase I to 1', () => {
      expect(normalizeShortCode58('I')).to.equal('1');
      expect(normalizeShortCode58('III')).to.equal('111');
    });

    it('handles mixed confusable characters', () => {
      expect(normalizeShortCode58('OoIl')).to.equal('0011');
      expect(normalizeShortCode58('lIOo')).to.equal('1100');
    });

    it('preserves valid ALPHABET_58 characters unchanged', () => {
      const validCode = 'abc123XYZ';
      expect(normalizeShortCode58(validCode)).to.equal(validCode);
    });

    it('normalizes a realistic mistyped code', () => {
      // User typed 'jeanOcaI' instead of 'jean0ca1'
      expect(normalizeShortCode58('jeanOcaI')).to.equal('jean0ca1');
    });

    it('handles empty string', () => {
      expect(normalizeShortCode58('')).to.equal('');
    });

    it('handles codes with no confusables', () => {
      const code = 'ABCdef123';
      expect(normalizeShortCode58(code)).to.equal(code);
    });

    it('is idempotent (normalizing twice gives same result)', () => {
      const input = 'OoIlABC123';
      const normalized = normalizeShortCode58(input);
      expect(normalizeShortCode58(normalized)).to.equal(normalized);
    });
  });

  describe('.calculateCombinations()', () => {
    it('calculates 58^8 correctly', () => {
      const result = calculateCombinations(58, 8);
      expect(result).to.equal(Math.pow(58, 8));
      // 58^8 = 128,063,081,718,016 (~128 trillion)
      expect(result).to.be.greaterThan(128_000_000_000_000);
      expect(result).to.be.lessThan(129_000_000_000_000);
    });

    it('calculates 56^8 correctly', () => {
      const result = calculateCombinations(56, 8);
      expect(result).to.equal(Math.pow(56, 8));
      // 56^8 = 96,717,311,574,016 (~96 trillion)
      expect(result).to.be.greaterThan(96_000_000_000_000);
      expect(result).to.be.lessThan(97_000_000_000_000);
    });

    it('calculates simple cases correctly', () => {
      expect(calculateCombinations(10, 1)).to.equal(10);
      expect(calculateCombinations(10, 2)).to.equal(100);
      expect(calculateCombinations(2, 10)).to.equal(1024);
      expect(calculateCombinations(26, 4)).to.equal(456976);
    });

    it('handles edge cases', () => {
      expect(calculateCombinations(1, 1)).to.equal(1);
      expect(calculateCombinations(100, 0)).to.equal(1);
      expect(calculateCombinations(1, 100)).to.equal(1);
    });
  });

});
