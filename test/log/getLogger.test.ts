import { expect } from 'chai';
import { getLogger } from '../../src/log/getLogger';

describe('getLogger with PII Sanitization', () => {
  const originalEnv = {
    LOG_HASH_SECRET: process.env.LOG_HASH_SECRET,
    LOG_USE_JSON_FORMAT: process.env.LOG_USE_JSON_FORMAT,
    LOG_INFO: process.env.LOG_INFO,
    LOG_DEBUG: process.env.LOG_DEBUG,
    LOG_TRACE: process.env.LOG_TRACE
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
});
