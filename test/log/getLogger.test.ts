import { expect } from 'chai';
import { getLogger, resetLogLevelRulesCache } from '../../src/log/getLogger';
import { resetEnvVarCache } from '../../src/env/environmentUtil';
import { d4l, d4lObfuscate } from '../../src/log/logUtil';

describe('getLogger with PII Sanitization', () => {
  const originalEnv = {
    LOG_HASH_SECRET: process.env.LOG_HASH_SECRET,
    LOG_USE_JSON_FORMAT: process.env.LOG_USE_JSON_FORMAT,
    LOG_INFO: process.env.LOG_INFO,
    LOG_DEBUG: process.env.LOG_DEBUG,
    LOG_TRACE: process.env.LOG_TRACE,
    LOG_LEVEL: process.env.LOG_LEVEL
  };

  let consoleOutput: string[] = [];
  let originalLog: any;
  let originalError: any;

  beforeEach(() => {
    // Capture console output
    consoleOutput = [];
    originalLog = console.log;
    originalError = console.error;
    console.log = (...args: any[]) => {
      const output = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      // Filter out tryGetEnvVar logging messages
      if (!output.includes('ts-gist-pile: tryGetEnvVar()')) {
        consoleOutput.push(output);
      }
    };
    console.error = (...args: any[]) => {
      const output = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      // Filter out tryGetEnvVar logging messages
      if (!output.includes('ts-gist-pile: tryGetEnvVar()')) {
        consoleOutput.push(output);
      }
    };
  });

  afterEach(() => {
    // Restore console
    console.log = originalLog;
    console.error = originalError;

    // Restore original environment
    Object.keys(originalEnv).forEach(key => {
      const value = originalEnv[key as keyof typeof originalEnv];
      if (value !== undefined) {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    });
  });

  describe('when LOG_HASH_SECRET is NOT set', () => {
    beforeEach(() => {
      delete process.env.LOG_HASH_SECRET;
      process.env.LOG_USE_JSON_FORMAT = 'true';
      process.env.LOG_INFO = 'true';
    });

    it('should log PII fields as-is in JSON format', () => {
      const logger = getLogger('test-logger');
      logger.info('User action', {
        userId: '12345',
        email: 'user@example.com',
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);
      expect(output.userId).to.equal('12345');
      expect(output.email).to.equal('user@example.com');
      expect(output.action).to.equal('login');
      expect(output).to.not.have.property('userId_hash');
      expect(output).to.not.have.property('email_hash');
    });
  });

  describe('when LOG_HASH_SECRET is SET', () => {
    beforeEach(() => {
      process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      process.env.LOG_USE_JSON_FORMAT = 'true';
      process.env.LOG_INFO = 'true';
    });

    it('should sanitize PII fields in JSON format logs', () => {
      const logger = getLogger('test-logger');
      logger.info('User action', {
        userId: '12345',
        email: 'user@example.com',
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      // PII fields should be hashed
      expect(output).to.not.have.property('userId');
      expect(output).to.not.have.property('email');
      expect(output).to.have.property('userId_hash');
      expect(output).to.have.property('email_hash');
      expect(output.userId_hash).to.be.a('string');
      expect(output.userId_hash).to.have.lengthOf(12);
      expect(output.email_hash).to.be.a('string');
      expect(output.email_hash).to.have.lengthOf(12);

      // Non-PII fields should remain
      expect(output.action).to.equal('login');
      expect(output.msg).to.equal('User action');
      expect(output.lvl).to.equal('INFO');
    });

    it('should sanitize nested PII fields', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        user: {
          userId: '12345',
          profile: {
            email: 'test@example.com',
            firstName: 'John'
          }
        },
        timestamp: '2023-01-01'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output.user).to.not.have.property('userId');
      expect(output.user).to.have.property('userId_hash');
      expect(output.user.profile).to.not.have.property('email');
      expect(output.user.profile).to.not.have.property('firstName');
      expect(output.user.profile).to.have.property('email_hash');
      expect(output.user.profile).to.have.property('firstName_hash');
      expect(output.timestamp).to.equal('2023-01-01');
    });

    it('should sanitize PII in arrays', () => {
      const logger = getLogger('test-logger');
      logger.info('Multiple users', {
        users: [
          { userId: 'user1', email: 'user1@example.com' },
          { userId: 'user2', email: 'user2@example.com' }
        ]
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output.users[0]).to.have.property('userId_hash');
      expect(output.users[0]).to.have.property('email_hash');
      expect(output.users[1]).to.have.property('userId_hash');
      expect(output.users[1]).to.have.property('email_hash');
      expect(output.users[0]).to.not.have.property('userId');
      expect(output.users[1]).to.not.have.property('email');
    });

    it('should create consistent hashes across multiple log calls', () => {
      const logger = getLogger('test-logger');

      logger.info('First log', { userId: '12345' });
      logger.info('Second log', { userId: '12345' });

      expect(consoleOutput).to.have.lengthOf(2);
      const output1 = JSON.parse(consoleOutput[0]);
      const output2 = JSON.parse(consoleOutput[1]);

      expect(output1.userId_hash).to.equal(output2.userId_hash);
    });

    it('should work with different log levels', () => {
      process.env.LOG_DEBUG = 'true';
      process.env.LOG_TRACE = 'true';

      const logger = getLogger('test-logger');

      logger.debug('Debug message', { userId: 'debug-user' });
      logger.info('Info message', { email: 'info@example.com' });
      logger.notice('Notice message', { principalId: 'principal-123' });

      expect(consoleOutput).to.have.lengthOf(3);

      const debugOutput = JSON.parse(consoleOutput[0]);
      expect(debugOutput).to.have.property('userId_hash');
      expect(debugOutput.lvl).to.equal('DEBUG');

      const infoOutput = JSON.parse(consoleOutput[1]);
      expect(infoOutput).to.have.property('email_hash');
      expect(infoOutput.lvl).to.equal('INFO');

      const noticeOutput = JSON.parse(consoleOutput[2]);
      expect(noticeOutput).to.have.property('principalId_hash');
      expect(noticeOutput.lvl).to.equal('NOTICE');
    });

    it('should sanitize PII with mixed case field names', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        UserId: 'user1',
        EMAIL: 'test@example.com',
        Phone_Number: '555-1234'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output).to.have.property('UserId_hash');
      expect(output).to.have.property('EMAIL_hash');
      expect(output).to.have.property('Phone_Number_hash');
      expect(output).to.not.have.property('UserId');
      expect(output).to.not.have.property('EMAIL');
      expect(output).to.not.have.property('Phone_Number');
    });
  });

  describe('plain text format with PII sanitization', () => {
    beforeEach(() => {
      process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      delete process.env.LOG_USE_JSON_FORMAT;
      process.env.LOG_INFO = 'true';
    });

    it('should sanitize PII fields in plain text logs', () => {
      const logger = getLogger('test-logger');
      logger.info('User action', {
        userId: '12345',
        email: 'user@example.com',
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = consoleOutput[0];

      // Should not contain raw PII
      expect(output).to.not.include('12345');
      expect(output).to.not.include('user@example.com');

      // Should contain the message and logger name
      expect(output).to.include('User action');
      expect(output).to.include('test-logger');

      // Should contain the sanitized JSON context
      expect(output).to.include('userId_hash');
      expect(output).to.include('email_hash');
      expect(output).to.include('action');
      expect(output).to.include('login');
    });
  });

  describe('Logger Factory', () => {
    it('should return the same logger instance for the same name', () => {
      const logger1 = getLogger('my-logger');
      const logger2 = getLogger('my-logger');

      expect(logger1).to.equal(logger2);
    });

    it('should return different logger instances for different names', () => {
      const logger1 = getLogger('logger-1');
      const logger2 = getLogger('logger-2');

      expect(logger1).to.not.equal(logger2);
    });
  });

  describe('PII sanitization with common compliance fields', () => {
    beforeEach(() => {
      process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      process.env.LOG_USE_JSON_FORMAT = 'true';
      process.env.LOG_INFO = 'true';
    });

    it('should sanitize HIPAA-related fields', () => {
      const logger = getLogger('test-logger');
      logger.info('Patient data', {
        ssn: '123-45-6789',
        dob: '1990-01-01',
        medicalRecordNumber: 'MRN12345'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output).to.have.property('ssn_hash');
      expect(output).to.have.property('dob_hash');
      expect(output).to.not.have.property('ssn');
      expect(output).to.not.have.property('dob');
    });

    it('should sanitize PCI-related fields', () => {
      const logger = getLogger('test-logger');
      logger.info('Payment data', {
        creditCard: '4111-1111-1111-1111',
        ccNumber: '5555-5555-5555-4444',
        transactionId: 'TXN123'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output).to.have.property('creditCard_hash');
      expect(output).to.have.property('ccNumber_hash');
      expect(output).to.not.have.property('creditCard');
      expect(output).to.not.have.property('ccNumber');
      expect(output.transactionId).to.equal('TXN123');
    });

    it('should sanitize GDPR-related fields', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        email: 'user@example.com',
        phone: '+1-555-1234',
        address: '123 Main St',
        ipAddress: '192.168.1.1'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output).to.have.property('email_hash');
      expect(output).to.have.property('phone_hash');
      expect(output).to.have.property('address_hash');
      expect(output).to.have.property('ipAddress_hash');
      expect(output).to.not.have.property('email');
      expect(output).to.not.have.property('phone');
      expect(output).to.not.have.property('address');
      expect(output).to.not.have.property('ipAddress');
    });
  });

  describe('LOG_LEVEL environment variable', () => {
    beforeEach(() => {
      // Clean up all log-related env vars
      delete process.env.LOG_TRACE;
      delete process.env.LOG_DEBUG;
      delete process.env.LOG_INFO;
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_USE_JSON_FORMAT;

      // Reset caches to ensure fresh reads
      resetEnvVarCache();
      resetLogLevelRulesCache();
    });

    it('should enable all levels when LOG_LEVEL=trace', () => {
      process.env.LOG_LEVEL = 'trace';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');

      // All three should be logged
      expect(consoleOutput.length).to.be.at.least(3);
      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.true;
      expect(consoleOutput.some(line => line.includes('debug message'))).to.be.true;
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.true;
    });

    it('should enable debug and above when LOG_LEVEL=debug', () => {
      process.env.LOG_LEVEL = 'debug';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');

      // Only debug and info should be logged
      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('debug message'))).to.be.true;
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.true;
    });

    it('should enable info and above when LOG_LEVEL=info', () => {
      process.env.LOG_LEVEL = 'info';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');

      // Only info should be logged
      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('debug message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.true;
    });

    it('should be case-insensitive', () => {
      process.env.LOG_LEVEL = 'TrAcE';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');

      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.true;
    });

    it('should log a warning for invalid LOG_LEVEL values', () => {
      process.env.LOG_LEVEL = 'invalid_level';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.info('info message');

      // Should have logged the warning about invalid LOG_LEVEL
      expect(consoleOutput.some(line =>
        line.includes('Invalid LOG_LEVEL value') && line.includes('invalid_level')
      )).to.be.true;
    });

    it('should allow individual level env vars to override LOG_LEVEL', () => {
      process.env.LOG_LEVEL = 'trace';
      process.env.LOG_TRACE = '0'; // Disable trace
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');

      // Trace should be disabled, but debug and info should work
      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('debug message'))).to.be.true;
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.true;
    });

    it('should allow LOG_DEBUG=0 to override LOG_LEVEL=trace', () => {
      process.env.LOG_LEVEL = 'trace';
      process.env.LOG_DEBUG = '0'; // Disable debug
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');

      // Debug should be disabled, but trace and info should work
      expect(consoleOutput.some(line => line.includes('trace message'))).to.be.true;
      expect(consoleOutput.some(line => line.includes('debug message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.true;
    });

    it('should support LOG_LEVEL=warn', () => {
      process.env.LOG_LEVEL = 'warn';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.info('info message');
      logger.warn('warn message');

      // Only warn should be logged
      expect(consoleOutput.some(line => line.includes('info message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('warn message'))).to.be.true;
    });

    it('should support LOG_LEVEL=error', () => {
      process.env.LOG_LEVEL = 'error';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.warn('warn message');
      logger.error('error message');

      // Only error should be logged
      expect(consoleOutput.some(line => line.includes('warn message'))).to.be.false;
      expect(consoleOutput.some(line => line.includes('error message'))).to.be.true;
    });
  });

  describe('when LOG_EAGER_AUTO_SANITIZE is enabled', () => {
    beforeEach(() => {
      delete process.env.LOG_HASH_SECRET;
      process.env.LOG_EAGER_AUTO_SANITIZE = 'true';
      process.env.LOG_USE_JSON_FORMAT = 'true';
      process.env.LOG_INFO = 'true';
      resetEnvVarCache();
      resetLogLevelRulesCache();
    });

    it('should eagerly redact PII fields without LOG_HASH_SECRET', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        password: 'neverguessme', // 12 chars -> last 2 (smart obfuscation)
        username: 'testuser', // 8 chars -> ****
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      // Field names should remain the same
      expect(output).to.have.property('password');
      expect(output).to.have.property('username');
      expect(output).to.not.have.property('password_redacted');
      expect(output).to.not.have.property('username_redacted');

      // Values should be obfuscated with smart context-aware obfuscation
      expect(output.password).to.equal('****me');
      expect(output.username).to.equal('****');
      expect(output.action).to.equal('login');
    });

    it('should redact nested PII fields', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        nested: {
          ssn: '111-22-5555', // SSN format -> last 4 (smart obfuscation)
          safe: 'data'
        }
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output.nested).to.have.property('ssn');
      expect(output.nested).to.not.have.property('ssn_redacted');
      expect(output.nested.ssn).to.equal('****5555');
      expect(output.nested.safe).to.equal('data');
    });

    it('should redact double nested email variations', () => {
      const logger = getLogger('test-logger');
      logger.info('User data', {
        double: {
          nested: {
            email: 'john@smith.com', // email format -> first 2 + domain (smart obfuscation)
            e_mail: 'jane@smith.com', // email format
            eMail: 'jack@smith.com' // email format
          }
        }
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      expect(output.double.nested).to.have.property('email');
      expect(output.double.nested).to.have.property('e_mail');
      expect(output.double.nested).to.have.property('eMail');
      expect(output.double.nested).to.not.have.property('email_redacted');
      expect(output.double.nested).to.not.have.property('e_mail_redacted');
      expect(output.double.nested).to.not.have.property('eMail_redacted');
      expect(output.double.nested.email).to.equal('jo****@smith.com');
      expect(output.double.nested.e_mail).to.equal('ja****@smith.com');
      expect(output.double.nested.eMail).to.equal('ja****@smith.com');
    });

    it('should work with plain text format', () => {
      delete process.env.LOG_USE_JSON_FORMAT;
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.info('User data', {
        password: 'secret123', // 9 chars -> ****
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = consoleOutput[0];

      // Should contain obfuscated password in JSON context
      expect(output).to.include('password');
      expect(output).to.include('****');
      expect(output).to.not.include('secret123');
      expect(output).to.include('login');
    });

    it('should not affect logs when LOG_EAGER_AUTO_SANITIZE is false', () => {
      process.env.LOG_EAGER_AUTO_SANITIZE = 'false';
      resetEnvVarCache();
      resetLogLevelRulesCache();

      const logger = getLogger('test-logger');
      logger.info('User data', {
        password: 'neverguessme',
        action: 'login'
      });

      expect(consoleOutput).to.have.lengthOf(1);
      const output = JSON.parse(consoleOutput[0]);

      // Without eager sanitization, password should appear as-is
      expect(output).to.have.property('password');
      expect(output.password).to.equal('neverguessme');
      expect(output).to.not.have.property('password_redacted');
    });

    describe('template string scenarios (objects in message string)', () => {
      it('SHOULD sanitize d4l() output when object is passed (d4l applies eager sanitization to objects)', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({password:'abc123'})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        // d4l() applies eager sanitization to objects when enabled
        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize nested objects in d4l() template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({ a: { password:'abc123'}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize deeply nested objects in d4l() template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({ a: { b: { password:'abc123'}}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize d4lObfuscate() output with objects (d4lObfuscate calls d4l which applies eager sanitization)', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4lObfuscate({password:'abc123'})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        // d4lObfuscate calls d4l, which applies eager sanitization to objects
        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize nested objects in d4lObfuscate() template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4lObfuscate({ a: { password:'abc123'}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize deeply nested objects in d4lObfuscate() template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4lObfuscate({ a: { b: { password:'abc123'}}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.not.include('abc123');
        expect(output.msg).to.include('****');
      });

      it('SHOULD sanitize when object is passed as context (2nd param)', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {password:'abc123'});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        // Context objects ARE sanitized by LOG_EAGER_AUTO_SANITIZE
        expect(output.password).to.not.equal('abc123');
        expect(output.password).to.equal('****');
      });

      it('SHOULD sanitize nested context objects', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {a: { password:'abc123'}});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.a.password).to.not.equal('abc123');
        expect(output.a.password).to.equal('****');
      });

      it('SHOULD sanitize deeply nested context objects', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {a: { b: { password:'abc123'}}});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.a.b.password).to.not.equal('abc123');
        expect(output.a.b.password).to.equal('****');
      });
    });

    describe('when LOG_EAGER_AUTO_SANITIZE is disabled', () => {
      beforeEach(() => {
        process.env.LOG_EAGER_AUTO_SANITIZE = 'false';
        resetEnvVarCache();
        resetLogLevelRulesCache();
      });

      it('should NOT sanitize d4l() in template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({password:'abc123'})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.include('abc123');
      });

      it('should NOT sanitize d4l() with nested objects in template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({ a: { password:'abc123'}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.include('abc123');
      });

      it('should NOT sanitize d4l() with deeply nested objects in template strings', () => {
        const logger = getLogger('test-logger');
        logger.info(`info = ${d4l({ a: { b: { password:'abc123'}}})}`);

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.msg).to.include('password');
        expect(output.msg).to.include('abc123');
      });

      it('should NOT sanitize context objects when disabled', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {password:'abc123'});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        // When disabled, context objects are NOT sanitized
        expect(output.password).to.equal('abc123');
      });

      it('should NOT sanitize nested context objects when disabled', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {a: { password:'abc123'}});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.a.password).to.equal('abc123');
      });

      it('should NOT sanitize deeply nested context objects when disabled', () => {
        const logger = getLogger('test-logger');
        logger.info('User data', {a: { b: { password:'abc123'}}});

        expect(consoleOutput).to.have.lengthOf(1);
        const output = JSON.parse(consoleOutput[0]);

        expect(output.a.b.password).to.equal('abc123');
      });
    });
  });
});
