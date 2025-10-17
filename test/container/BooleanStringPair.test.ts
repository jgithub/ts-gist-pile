import { expect } from 'chai';
import { BooleanStringPair } from '../../src/container/BooleanStringPair';

describe('BooleanStringPair', () => {
  describe('constructor and basic functionality', () => {
    it('stores and retrieves true with a string', () => {
      const pair = new BooleanStringPair(true, 'success');

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal('success');
    });

    it('stores and retrieves false with a string', () => {
      const pair = new BooleanStringPair(false, 'failure');

      expect(pair.getBooleanValue()).to.be.false;
      expect(pair.getStringValue()).to.equal('failure');
    });
  });

  describe('with different string values', () => {
    it('works with empty string', () => {
      const pair = new BooleanStringPair(true, '');

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal('');
    });

    it('works with whitespace string', () => {
      const pair = new BooleanStringPair(false, '   ');

      expect(pair.getBooleanValue()).to.be.false;
      expect(pair.getStringValue()).to.equal('   ');
    });

    it('works with multiline string', () => {
      const multiline = 'line1\nline2\nline3';
      const pair = new BooleanStringPair(true, multiline);

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal(multiline);
    });

    it('works with special characters', () => {
      const special = '!@#$%^&*(){}[]<>?/\\|';
      const pair = new BooleanStringPair(false, special);

      expect(pair.getBooleanValue()).to.be.false;
      expect(pair.getStringValue()).to.equal(special);
    });

    it('works with unicode characters', () => {
      const unicode = '你好世界 🌍 مرحبا';
      const pair = new BooleanStringPair(true, unicode);

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal(unicode);
    });

    it('works with long strings', () => {
      const longString = 'a'.repeat(10000);
      const pair = new BooleanStringPair(false, longString);

      expect(pair.getBooleanValue()).to.be.false;
      expect(pair.getStringValue()).to.have.lengthOf(10000);
    });
  });

  describe('immutability', () => {
    it('returns the same values on repeated calls', () => {
      const pair = new BooleanStringPair(true, 'test');

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal('test');
      expect(pair.getStringValue()).to.equal('test');
    });

    it('boolean and string are independent', () => {
      const pair = new BooleanStringPair(true, 'false');

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal('false');
    });
  });

  describe('use case scenarios', () => {
    it('represents a validation result with error message', () => {
      const validResult = new BooleanStringPair(true, 'Validation passed');
      const invalidResult = new BooleanStringPair(false, 'Email format is invalid');

      expect(validResult.getBooleanValue()).to.be.true;
      expect(validResult.getStringValue()).to.equal('Validation passed');

      expect(invalidResult.getBooleanValue()).to.be.false;
      expect(invalidResult.getStringValue()).to.equal('Email format is invalid');
    });

    it('represents a success flag with status message', () => {
      const success = new BooleanStringPair(true, 'Operation completed successfully');

      expect(success.getBooleanValue()).to.be.true;
      expect(success.getStringValue()).to.include('successfully');
    });

    it('represents a feature flag with description', () => {
      const featureEnabled = new BooleanStringPair(true, 'New checkout flow enabled');
      const featureDisabled = new BooleanStringPair(false, 'A/B test variant disabled');

      expect(featureEnabled.getBooleanValue()).to.be.true;
      expect(featureEnabled.getStringValue()).to.include('enabled');

      expect(featureDisabled.getBooleanValue()).to.be.false;
      expect(featureDisabled.getStringValue()).to.include('disabled');
    });

    it('represents a permission check with reason', () => {
      const allowed = new BooleanStringPair(true, 'User has admin role');
      const denied = new BooleanStringPair(false, 'Insufficient permissions');

      expect(allowed.getBooleanValue()).to.be.true;
      expect(denied.getBooleanValue()).to.be.false;
      expect(denied.getStringValue()).to.equal('Insufficient permissions');
    });

    it('represents a parsing result with details', () => {
      const parseSuccess = new BooleanStringPair(true, 'Parsed 150 records');
      const parseFailure = new BooleanStringPair(false, 'Line 42: Invalid date format');

      expect(parseSuccess.getBooleanValue()).to.be.true;
      expect(parseSuccess.getStringValue()).to.include('150');

      expect(parseFailure.getBooleanValue()).to.be.false;
      expect(parseFailure.getStringValue()).to.include('Line 42');
    });
  });

  describe('edge cases', () => {
    it('handles string representation of boolean that differs from actual boolean', () => {
      const pair1 = new BooleanStringPair(true, 'false');
      const pair2 = new BooleanStringPair(false, 'true');

      expect(pair1.getBooleanValue()).to.be.true;
      expect(pair1.getStringValue()).to.equal('false');

      expect(pair2.getBooleanValue()).to.be.false;
      expect(pair2.getStringValue()).to.equal('true');
    });

    it('handles numeric strings', () => {
      const pair = new BooleanStringPair(true, '12345');

      expect(pair.getBooleanValue()).to.be.true;
      expect(pair.getStringValue()).to.equal('12345');
    });

    it('handles JSON strings', () => {
      const jsonString = JSON.stringify({ error: 'Not found', code: 404 });
      const pair = new BooleanStringPair(false, jsonString);

      expect(pair.getBooleanValue()).to.be.false;
      expect(pair.getStringValue()).to.equal(jsonString);
      expect(() => JSON.parse(pair.getStringValue())).to.not.throw();
    });
  });
});
