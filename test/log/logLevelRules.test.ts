import { expect } from 'chai';
import { getLogger, resetLogLevelRulesCache } from '../../src/log/getLogger';

// Suppress tryGetEnvVar debug logs at module load time
const originalLog = console.log;
console.log = () => {};

// Trigger initial memoization of LOG_LEVEL_RULES by setting it and parsing once
process.env.LOG_LEVEL_RULES = '[]';
getLogger('__init__');
delete process.env.LOG_LEVEL_RULES;

// Restore console.log
console.log = originalLog;

describe('Log Level Rules Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let savedLog: typeof console.log;
  let savedError: typeof console.error;

  // Helper to setup logger configuration without triggering tryGetEnvVar logs
  function setupLoggerWithRules(rules: any[]): void {
    process.env.LOG_LEVEL_RULES = JSON.stringify(rules);
    resetLogLevelRulesCache();
  }

  beforeEach(() => {
    // Save original environment and console methods
    originalEnv = { ...process.env };
    savedLog = console.log;
    savedError = console.error;
  });

  afterEach(() => {
    // Restore original environment and console methods
    process.env = originalEnv;
    console.log = savedLog;
    console.error = savedError;
    // Clear the cached rules
    resetLogLevelRulesCache();
  });

  describe('Pattern Matching', () => {
    it('should match exact logger names', () => {
      setupLoggerWithRules([
        { pattern: 'api.users', level: 'DEBUG' }
      ]);

      const logger = getLogger('api.users');

      // Capture console output
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);

      logger.debug('test message');
      logger.trace('should not appear');

      console.log = savedLog;

      // Filter out tryGetEnvVar debug messages
      const actualLogs = logs.filter(log => !log.includes('tryGetEnvVar'));

      expect(actualLogs.length).to.equal(1);
      expect(actualLogs[0]).to.include('DEBUG');
      expect(actualLogs[0]).to.include('test message');
    });

    it('should match suffix wildcards (api.*)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.*', level: 'INFO' }
      ]);
      resetLogLevelRulesCache();

      const logger1 = getLogger('api.users');
      const logger2 = getLogger('api.products');
      const logger3 = getLogger('db.users');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.info('api.users info');
      logger2.info('api.products info');
      logger3.info('db.users info'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(2);
      expect(logs[0]).to.include('api.users info');
      expect(logs[1]).to.include('api.products info');
    });

    it('should match prefix wildcards (*.service)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: '*.service', level: 'DEBUG' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('api.service');
      const logger2 = getLogger('db.service');
      const logger3 = getLogger('api.controller');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.debug('api.service debug');
      logger2.debug('db.service debug');
      logger3.debug('api.controller debug'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(2);
      expect(logs[0]).to.include('api.service debug');
      expect(logs[1]).to.include('db.service debug');
    });

    it('should match middle wildcards (api.*.service)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.*.service', level: 'TRACE' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('api.users.service');
      const logger2 = getLogger('api.products.service');
      const logger3 = getLogger('api.users.controller');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.trace('api.users.service trace');
      logger2.trace('api.products.service trace');
      logger3.trace('api.users.controller trace'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(2);
      expect(logs[0]).to.include('api.users.service trace');
      expect(logs[1]).to.include('api.products.service trace');
    });

    it('should match wildcard-only pattern (*)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: '*', level: 'DEBUG' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('any.logger.name');
      const logger2 = getLogger('another');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.debug('any.logger.name debug');
      logger2.debug('another debug');

      console.log = originalLog;

      expect(logs.length).to.equal(2);
    });
  });

  describe('First Match Wins (Order Matters)', () => {
    it('should use first matching rule (exact match first)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.users', level: 'TRACE' },
        { pattern: 'api.*', level: 'INFO' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('api.users');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.trace('trace message');
      logger.debug('debug message');

      console.log = originalLog;

      expect(logs.length).to.equal(2);
      expect(logs[0]).to.include('trace message');
      expect(logs[1]).to.include('debug message');
    });

    it('should use first matching rule even if less specific', () => {
      // This demonstrates that order matters - first match wins
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.*', level: 'INFO' },
        { pattern: 'api.users', level: 'TRACE' } // This won't be used for api.users
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('api.users');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.info('info message');
      logger.debug('debug message'); // Should not appear
      logger.trace('trace message'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(1);
      expect(logs[0]).to.include('info message');
    });

    it('should handle proper ordering from specific to general', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.users.*', level: 'TRACE' },
        { pattern: 'api.*', level: 'DEBUG' },
        { pattern: '*', level: 'WARN' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('api.users.controller');
      const logger2 = getLogger('api.products');
      const logger3 = getLogger('db.connection');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      // api.users.controller should be TRACE (first match)
      logger1.trace('trace for api.users.controller');
      // api.products should be DEBUG (second match)
      logger2.debug('debug for api.products');
      logger2.trace('trace for api.products'); // Should not appear
      // db.connection should be WARN (third match)
      logger3.warn('warn for db.connection');
      logger3.info('info for db.connection'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(3);
      expect(logs[0]).to.include('trace for api.users.controller');
      expect(logs[1]).to.include('debug for api.products');
      expect(logs[2]).to.include('warn for db.connection');
    });

    it('should use first rule when same pattern appears multiple times', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.users', level: 'DEBUG' },
        { pattern: 'api.users', level: 'TRACE' } // This is ignored
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('api.users');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.debug('debug message');
      logger.trace('trace message'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(1);
      expect(logs[0]).to.include('debug message');
    });
  });

  describe('Log Level Hierarchy', () => {
    it('should respect log level hierarchy (TRACE enables all)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'test.logger', level: 'TRACE' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.trace('trace');
      logger.debug('debug');
      logger.info('info');
      logger.notice('notice');

      console.log = originalLog;

      expect(logs.length).to.equal(4);
    });

    it('should respect log level hierarchy (INFO enables INFO and above)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'test.logger', level: 'INFO' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.trace('trace'); // Should not appear
      logger.debug('debug'); // Should not appear
      logger.info('info');
      logger.notice('notice');
      logger.warn('warn');

      console.log = originalLog;

      expect(logs.length).to.equal(3);
      expect(logs[0]).to.include('info');
      expect(logs[1]).to.include('notice');
      expect(logs[2]).to.include('warn');
    });

    it('should respect log level hierarchy (ERROR enables only ERROR and FATAL)', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'test.logger', level: 'ERROR' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      const logs: string[] = [];
      const errors: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      console.log = (msg: string) => logs.push(msg);
      console.error = (msg: string) => errors.push(msg);

      logger.info('info'); // Should not appear
      logger.warn('warn'); // Should not appear
      logger.error('error');
      logger.fatal('fatal');

      console.log = originalLog;
      console.error = originalError;

      expect(logs.length + errors.length).to.equal(2);
    });
  });

  describe('Fallback to Legacy Environment Variables', () => {
    it('should fall back to LOG_DEBUG when no rules match', () => {
      process.env.LOG_DEBUG = 'true';
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.*', level: 'INFO' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('db.connection'); // Doesn't match api.*

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.debug('debug message');

      console.log = originalLog;

      expect(logs.length).to.equal(1);
      expect(logs[0]).to.include('debug message');
    });

    it('should prefer rules over legacy environment variables', () => {
      process.env.LOG_INFO = 'true'; // This would normally enable INFO
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.users', level: 'ERROR' } // But this restricts to ERROR
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('api.users');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.info('info message'); // Should not appear
      logger.error('error message');

      console.log = originalLog;

      expect(logs.length).to.equal(1);
      expect(logs[0]).to.include('error message');
    });
  });

  describe('Invalid Configuration', () => {
    it('should handle invalid JSON gracefully', () => {
      process.env.LOG_LEVEL_RULES = 'not valid json';

      const errors: string[] = [];
      const originalError = console.error;
      console.error = (...args: any[]) => errors.push(args.join(' '));

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      console.error = originalError;

      expect(errors.some(e => e.includes('Failed to parse LOG_LEVEL_RULES'))).to.be.true;
    });

    it('should handle non-array JSON gracefully', () => {
      process.env.LOG_LEVEL_RULES = '{"pattern": "api.*", "level": "DEBUG"}';

      const errors: string[] = [];
      const originalError = console.error;
      console.error = (...args: any[]) => errors.push(args.join(' '));

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      console.error = originalError;

      expect(errors.some(e => e.includes('must be a JSON array'))).to.be.true;
    });

    it('should skip invalid rules', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.*', level: 'DEBUG' },
        { pattern: 'missing level' }, // Invalid
        { level: 'INFO' }, // Missing pattern
        { pattern: 'db.*', level: 'TRACE' }
      ]);

      const errors: string[] = [];
      const originalError = console.error;
      console.error = (...args: any[]) => errors.push(args.join(' '));

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('api.users');
      const logger2 = getLogger('db.connection');

      console.error = originalError;

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.debug('api debug');
      logger2.trace('db trace');

      console.log = originalLog;

      // Both valid rules should work
      expect(logs.length).to.equal(2);
      // Error messages for invalid rules
      expect(errors.some(e => e.includes('Invalid rule'))).to.be.true;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rules array', () => {
      process.env.LOG_LEVEL_RULES = '[]';
      process.env.LOG_DEBUG = 'true';

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('test.logger');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.debug('debug message');

      console.log = originalLog;

      // Should fall back to LOG_DEBUG
      expect(logs.length).to.equal(1);
    });

    it('should handle logger names with special regex characters', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: 'api.users[v2]', level: 'DEBUG' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger = getLogger('api.users[v2]');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger.debug('debug message');

      console.log = originalLog;

      expect(logs.length).to.equal(1);
      expect(logs[0]).to.include('debug message');
    });

    it('should handle patterns with multiple wildcards', () => {
      process.env.LOG_LEVEL_RULES = JSON.stringify([
        { pattern: '*.users.*', level: 'INFO' }
      ]);

      resetLogLevelRulesCache();
      // Cache reset above

      const logger1 = getLogger('api.users.service');
      const logger2 = getLogger('db.users.repository');
      const logger3 = getLogger('api.products.service');

      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      logger1.info('api.users.service info');
      logger2.info('db.users.repository info');
      logger3.info('api.products.service info'); // Should not appear

      console.log = originalLog;

      expect(logs.length).to.equal(2);
    });
  });
});
