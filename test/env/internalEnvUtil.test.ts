import { expect } from 'chai';
import { tryGetEnvVar, isProductionEnv, isDevelopmentEnv, isStagingEnv } from '../../src/env/internalEnvUtil';

describe('internalEnvUtil', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleOutput: string[] = [];
  let originalLog: any;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Capture console output for memoization tests
    consoleOutput = [];
    originalLog = console.log;
    console.log = (...args: any[]) => {
      consoleOutput.push(args.join(' '));
      originalLog(...args);
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Restore console
    console.log = originalLog;
  });

  describe('tryGetEnvVar', () => {
    it('should return undefined when env var is not set', () => {
      delete process.env.MY_VAR;
      delete process.env.REACT_APP_MY_VAR;
      delete process.env.VITE_MY_VAR;

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.be.undefined;
    });

    it('should return value when env var is set directly', () => {
      process.env.MY_VAR = 'direct-value';

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.equal('direct-value');
    });

    it('should return value with REACT_APP_ prefix', () => {
      delete process.env.MY_VAR;
      process.env.REACT_APP_MY_VAR = 'react-value';

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.equal('react-value');
    });

    it('should return value with VITE_ prefix', () => {
      delete process.env.MY_VAR;
      delete process.env.REACT_APP_MY_VAR;
      process.env.VITE_MY_VAR = 'vite-value';

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.equal('vite-value');
    });

    it('should prioritize direct env var over prefixed versions', () => {
      process.env.MY_VAR = 'direct-value';
      process.env.REACT_APP_MY_VAR = 'react-value';
      process.env.VITE_MY_VAR = 'vite-value';

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.equal('direct-value');
    });

    it('should prioritize REACT_APP_ prefix over VITE_ prefix', () => {
      delete process.env.MY_VAR;
      process.env.REACT_APP_MY_VAR = 'react-value';
      process.env.VITE_MY_VAR = 'vite-value';

      const result = tryGetEnvVar('MY_VAR');
      expect(result).to.equal('react-value');
    });

    it('should handle empty string values', () => {
      process.env.EMPTY_VAR = '';

      const result = tryGetEnvVar('EMPTY_VAR');
      expect(result).to.equal('');
    });

    it('should handle whitespace values', () => {
      process.env.WHITESPACE_VAR = '   ';

      const result = tryGetEnvVar('WHITESPACE_VAR');
      expect(result).to.equal('   ');
    });

    it('should memoize console logs to avoid duplicate messages', () => {
      process.env.MY_MEMOIZED_VAR = 'test-value';

      // Clear any previous console output
      consoleOutput = [];

      // First call should log
      tryGetEnvVar('MY_MEMOIZED_VAR');
      const firstCallLogCount = consoleOutput.length;
      expect(firstCallLogCount).to.be.greaterThan(0);

      // Second call should NOT log again (memoized)
      tryGetEnvVar('MY_MEMOIZED_VAR');
      const secondCallLogCount = consoleOutput.length;
      expect(secondCallLogCount).to.equal(firstCallLogCount);

      // Third call should still not log
      tryGetEnvVar('MY_MEMOIZED_VAR');
      const thirdCallLogCount = consoleOutput.length;
      expect(thirdCallLogCount).to.equal(firstCallLogCount);
    });

    it('should log when finding env var with REACT_APP_ prefix', () => {
      delete process.env.PREFIXED_VAR;
      process.env.REACT_APP_PREFIXED_VAR = 'react-value';

      consoleOutput = [];
      tryGetEnvVar('PREFIXED_VAR');

      expect(consoleOutput.some(log =>
        log.includes('REACT_APP_PREFIXED_VAR') && log.includes('react-value')
      )).to.be.true;
    });

    it('should log when finding env var with VITE_ prefix', () => {
      delete process.env.PREFIXED_VAR;
      delete process.env.REACT_APP_PREFIXED_VAR;
      process.env.VITE_PREFIXED_VAR = 'vite-value';

      consoleOutput = [];
      tryGetEnvVar('PREFIXED_VAR');

      expect(consoleOutput.some(log =>
        log.includes('VITE_PREFIXED_VAR') && log.includes('vite-value')
      )).to.be.true;
    });

    it('should handle special characters in env var names', () => {
      process.env.MY_SPECIAL_VAR_123 = 'special-value';

      const result = tryGetEnvVar('MY_SPECIAL_VAR_123');
      expect(result).to.equal('special-value');
    });

    it('should handle numeric string values', () => {
      process.env.NUMERIC_VAR = '12345';

      const result = tryGetEnvVar('NUMERIC_VAR');
      expect(result).to.equal('12345');
    });

    it('should handle boolean-like string values', () => {
      process.env.BOOL_VAR = 'true';

      const result = tryGetEnvVar('BOOL_VAR');
      expect(result).to.equal('true');
    });
  });

  describe('isProductionEnv', () => {
    it('should return true when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isProductionEnv()).to.be.true;
    });

    it('should return true when NODE_ENV is "prod"', () => {
      process.env.NODE_ENV = 'prod';
      expect(isProductionEnv()).to.be.true;
    });

    it('should return false when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isProductionEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is "staging"', () => {
      process.env.NODE_ENV = 'staging';
      expect(isProductionEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(isProductionEnv()).to.be.false;
    });

    it('should return false for random NODE_ENV values', () => {
      process.env.NODE_ENV = 'random';
      expect(isProductionEnv()).to.be.false;
    });

    it('should work with REACT_APP_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      process.env.REACT_APP_NODE_ENV = 'production';
      expect(isProductionEnv()).to.be.true;
    });

    it('should work with VITE_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      delete process.env.REACT_APP_NODE_ENV;
      process.env.VITE_NODE_ENV = 'prod';
      expect(isProductionEnv()).to.be.true;
    });
  });

  describe('isDevelopmentEnv', () => {
    it('should return true when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopmentEnv()).to.be.true;
    });

    it('should return true when NODE_ENV is "dev"', () => {
      process.env.NODE_ENV = 'dev';
      expect(isDevelopmentEnv()).to.be.true;
    });

    it('should return false when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopmentEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is "staging"', () => {
      process.env.NODE_ENV = 'staging';
      expect(isDevelopmentEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(isDevelopmentEnv()).to.be.false;
    });

    it('should return false for random NODE_ENV values', () => {
      process.env.NODE_ENV = 'random';
      expect(isDevelopmentEnv()).to.be.false;
    });

    it('should work with REACT_APP_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      process.env.REACT_APP_NODE_ENV = 'development';
      expect(isDevelopmentEnv()).to.be.true;
    });

    it('should work with VITE_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      delete process.env.REACT_APP_NODE_ENV;
      process.env.VITE_NODE_ENV = 'dev';
      expect(isDevelopmentEnv()).to.be.true;
    });
  });

  describe('isStagingEnv', () => {
    it('should return true when NODE_ENV is "staging"', () => {
      process.env.NODE_ENV = 'staging';
      expect(isStagingEnv()).to.be.true;
    });

    it('should return true when NODE_ENV is "stage"', () => {
      process.env.NODE_ENV = 'stage';
      expect(isStagingEnv()).to.be.true;
    });

    it('should return false when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isStagingEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isStagingEnv()).to.be.false;
    });

    it('should return false when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(isStagingEnv()).to.be.false;
    });

    it('should return false for random NODE_ENV values', () => {
      process.env.NODE_ENV = 'random';
      expect(isStagingEnv()).to.be.false;
    });

    it('should work with REACT_APP_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      process.env.REACT_APP_NODE_ENV = 'staging';
      expect(isStagingEnv()).to.be.true;
    });

    it('should work with VITE_NODE_ENV prefix', () => {
      delete process.env.NODE_ENV;
      delete process.env.REACT_APP_NODE_ENV;
      process.env.VITE_NODE_ENV = 'stage';
      expect(isStagingEnv()).to.be.true;
    });
  });

  describe('environment check combinations', () => {
    it('should only return true for one environment check at a time', () => {
      process.env.NODE_ENV = 'production';
      expect(isProductionEnv()).to.be.true;
      expect(isDevelopmentEnv()).to.be.false;
      expect(isStagingEnv()).to.be.false;

      process.env.NODE_ENV = 'development';
      expect(isProductionEnv()).to.be.false;
      expect(isDevelopmentEnv()).to.be.true;
      expect(isStagingEnv()).to.be.false;

      process.env.NODE_ENV = 'staging';
      expect(isProductionEnv()).to.be.false;
      expect(isDevelopmentEnv()).to.be.false;
      expect(isStagingEnv()).to.be.true;
    });

    it('should all return false when NODE_ENV is unrecognized', () => {
      process.env.NODE_ENV = 'test';
      expect(isProductionEnv()).to.be.false;
      expect(isDevelopmentEnv()).to.be.false;
      expect(isStagingEnv()).to.be.false;
    });
  });
});
