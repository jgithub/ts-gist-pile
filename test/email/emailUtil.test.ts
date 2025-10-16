import { expect } from 'chai';
import { normalizeEmail } from '../../src/email/emailUtil';

describe('emailUtil', () => {
  describe('normalizeEmail', () => {
    it('should trim whitespace and convert to lowercase', () => {
      const result = normalizeEmail('  User@Example.COM  ');
      expect(result).to.equal('user@example.com');
    });

    it('should handle already normalized emails', () => {
      const result = normalizeEmail('user@example.com');
      expect(result).to.equal('user@example.com');
    });

    it('should handle uppercase emails', () => {
      const result = normalizeEmail('USER@EXAMPLE.COM');
      expect(result).to.equal('user@example.com');
    });

    it('should handle mixed case emails', () => {
      const result = normalizeEmail('UsEr@ExAmPlE.CoM');
      expect(result).to.equal('user@example.com');
    });

    it('should trim leading whitespace', () => {
      const result = normalizeEmail('   user@example.com');
      expect(result).to.equal('user@example.com');
    });

    it('should trim trailing whitespace', () => {
      const result = normalizeEmail('user@example.com   ');
      expect(result).to.equal('user@example.com');
    });

    it('should handle tabs and other whitespace', () => {
      const result = normalizeEmail('\t\nuser@example.com\t\n');
      expect(result).to.equal('user@example.com');
    });

    it('should handle emails with plus addressing', () => {
      const result = normalizeEmail('User+Tag@Example.COM');
      expect(result).to.equal('user+tag@example.com');
    });

    it('should handle emails with dots in local part', () => {
      const result = normalizeEmail('First.Last@Example.COM');
      expect(result).to.equal('first.last@example.com');
    });

    it('should handle emails with numbers', () => {
      const result = normalizeEmail('User123@Example456.COM');
      expect(result).to.equal('user123@example456.com');
    });

    it('should handle emails with hyphens in domain', () => {
      const result = normalizeEmail('User@My-Example.COM');
      expect(result).to.equal('user@my-example.com');
    });

    it('should handle subdomain emails', () => {
      const result = normalizeEmail('User@Mail.Example.COM');
      expect(result).to.equal('user@mail.example.com');
    });

    it('should handle long TLDs', () => {
      const result = normalizeEmail('User@Example.Technology');
      expect(result).to.equal('user@example.technology');
    });

    it('should handle international characters (already lowercase)', () => {
      const result = normalizeEmail('user@café.com');
      expect(result).to.equal('user@café.com');
    });

    it('should handle email with underscores', () => {
      const result = normalizeEmail('User_Name@Example.COM');
      expect(result).to.equal('user_name@example.com');
    });

    it('should be idempotent', () => {
      const email = '  User@Example.COM  ';
      const normalized1 = normalizeEmail(email);
      const normalized2 = normalizeEmail(normalized1);
      expect(normalized1).to.equal(normalized2);
    });

    it('should handle empty local part edge case', () => {
      // While technically invalid, test that it still processes
      const result = normalizeEmail('@Example.COM');
      expect(result).to.equal('@example.com');
    });

    it('should preserve special characters allowed in emails', () => {
      const result = normalizeEmail('User!#$%@Example.COM');
      expect(result).to.equal('user!#$%@example.com');
    });
  });
});
