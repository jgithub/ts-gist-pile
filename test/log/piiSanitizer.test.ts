import { expect } from 'chai';
import { sanitizePII, isPIISecureModeEnabled, getPIIFieldNames } from '../../src/log/piiSanitizer';

describe('PII Sanitizer', () => {
  const originalEnv = process.env.LOG_HASH_SECRET;

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.LOG_HASH_SECRET = originalEnv;
    } else {
      delete process.env.LOG_HASH_SECRET;
    }
  });

  describe('isPIISecureModeEnabled', () => {
    it('should return false when LOG_HASH_SECRET is not set', () => {
      delete process.env.LOG_HASH_SECRET;
      expect(isPIISecureModeEnabled()).to.be.false;
    });

    it('should return true when LOG_HASH_SECRET is set in Node.js', () => {
      process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      expect(isPIISecureModeEnabled()).to.be.true;
    });

    it('should return false when LOG_HASH_SECRET is empty', () => {
      process.env.LOG_HASH_SECRET = '';
      expect(isPIISecureModeEnabled()).to.be.false;
    });
  });

  describe('sanitizePII', () => {
    describe('when PII mode is disabled', () => {
      beforeEach(() => {
        delete process.env.LOG_HASH_SECRET;
      });

      it('should return object as-is when PII mode is disabled', () => {
        const input = {
          userId: '12345',
          email: 'user@example.com',
          normalField: 'value'
        };

        const result = sanitizePII(input);

        expect(result).to.deep.equal(input);
      });
    });

    describe('when PII mode is enabled', () => {
      beforeEach(() => {
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      });

      it('should hash userId field', () => {
        const input = { userId: '12345', other: 'value' };
        const result = sanitizePII(input);

        expect(result).to.not.have.property('userId');
        expect(result).to.have.property('userId_hash');
        expect(result.userId_hash).to.be.a('string');
        expect(result.userId_hash).to.have.lengthOf(12);
        expect(result.other).to.equal('value');
      });

      it('should hash email field', () => {
        const input = { email: 'user@example.com', status: 'active' };
        const result = sanitizePII(input);

        expect(result).to.not.have.property('email');
        expect(result).to.have.property('email_hash');
        expect(result.email_hash).to.be.a('string');
        expect(result.status).to.equal('active');
      });

      it('should hash multiple PII fields', () => {
        const input = {
          userId: '12345',
          email: 'user@example.com',
          phone: '555-1234',
          normalField: 'keep-me'
        };

        const result = sanitizePII(input);

        expect(result).to.not.have.property('userId');
        expect(result).to.not.have.property('email');
        expect(result).to.not.have.property('phone');
        expect(result).to.have.property('userId_hash');
        expect(result).to.have.property('email_hash');
        expect(result).to.have.property('phone_hash');
        expect(result.normalField).to.equal('keep-me');
      });

      it('should create consistent hashes for same value', () => {
        const input1 = { userId: '12345' };
        const input2 = { userId: '12345' };

        const result1 = sanitizePII(input1);
        const result2 = sanitizePII(input2);

        expect(result1.userId_hash).to.equal(result2.userId_hash);
      });

      it('should create different hashes for different values', () => {
        const input1 = { userId: '12345' };
        const input2 = { userId: '67890' };

        const result1 = sanitizePII(input1);
        const result2 = sanitizePII(input2);

        expect(result1.userId_hash).to.not.equal(result2.userId_hash);
      });

      it('should handle null values', () => {
        const input = { userId: null, email: undefined };
        const result = sanitizePII(input);

        expect(result).to.have.property('userId_hash');
        expect(result.userId_hash).to.equal('null');
      });

      it('should handle nested objects', () => {
        const input = {
          user: {
            userId: '12345',
            email: 'user@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe'
            }
          },
          normalField: 'value'
        };

        const result = sanitizePII(input);

        expect(result.user).to.not.have.property('userId');
        expect(result.user).to.have.property('userId_hash');
        expect(result.user.profile).to.not.have.property('firstName');
        expect(result.user.profile).to.have.property('firstName_hash');
        expect(result.normalField).to.equal('value');
      });

      it('should handle arrays', () => {
        const input = {
          users: [
            { userId: '1', email: 'user1@example.com' },
            { userId: '2', email: 'user2@example.com' }
          ]
        };

        const result = sanitizePII(input);

        expect(result.users[0]).to.not.have.property('userId');
        expect(result.users[0]).to.have.property('userId_hash');
        expect(result.users[1]).to.not.have.property('email');
        expect(result.users[1]).to.have.property('email_hash');
      });

      it('should handle case-insensitive PII field matching', () => {
        const input = {
          UserId: '12345',
          EMAIL: 'user@example.com',
          Phone_Number: '555-1234'
        };

        const result = sanitizePII(input);

        expect(result).to.not.have.property('UserId');
        expect(result).to.have.property('UserId_hash');
        expect(result).to.not.have.property('EMAIL');
        expect(result).to.have.property('EMAIL_hash');
      });

      it('should return null for null input', () => {
        expect(sanitizePII(null)).to.be.null;
      });

      it('should return primitives as-is', () => {
        expect(sanitizePII('string')).to.equal('string');
        expect(sanitizePII(123)).to.equal(123);
        expect(sanitizePII(true)).to.equal(true);
      });

      it('should hash principalId field', () => {
        const input = { principalId: 'principal-12345', action: 'login' };
        const result = sanitizePII(input);

        expect(result).to.not.have.property('principalId');
        expect(result).to.have.property('principalId_hash');
        expect(result.principalId_hash).to.be.a('string');
        expect(result.action).to.equal('login');
      });

      it('should hash emailSanitized field', () => {
        const input = { emailSanitized: 'user@example.com', status: 'active' };
        const result = sanitizePII(input);

        expect(result).to.not.have.property('emailSanitized');
        expect(result).to.have.property('emailSanitized_hash');
        expect(result.emailSanitized_hash).to.be.a('string');
        expect(result.status).to.equal('active');
      });

      it('should hash fields with underscore prefix', () => {
        const input = {
          _userId: '12345',
          _email: 'user@example.com',
          _phone: '555-1234',
          normalField: 'value'
        };

        const result = sanitizePII(input);

        expect(result).to.not.have.property('_userId');
        expect(result).to.not.have.property('_email');
        expect(result).to.not.have.property('_phone');
        expect(result).to.have.property('_userId_hash');
        expect(result).to.have.property('_email_hash');
        expect(result).to.have.property('_phone_hash');
        expect(result.normalField).to.equal('value');
      });

      it('should handle nested objects with underscore-prefixed PII fields', () => {
        const input = {
          _attrs: {
            _userId: '12345',
            _email: 'user@example.com',
            status: 'active'
          },
          metadata: {
            _principalId: 'principal-abc',
            timestamp: '2023-01-01'
          }
        };

        const result = sanitizePII(input);

        // Check _attrs._userId is hashed
        expect(result._attrs).to.not.have.property('_userId');
        expect(result._attrs).to.have.property('_userId_hash');
        expect(result._attrs._userId_hash).to.be.a('string');

        // Check _attrs._email is hashed
        expect(result._attrs).to.not.have.property('_email');
        expect(result._attrs).to.have.property('_email_hash');

        // Check _attrs.status is preserved
        expect(result._attrs.status).to.equal('active');

        // Check metadata._principalId is hashed
        expect(result.metadata).to.not.have.property('_principalId');
        expect(result.metadata).to.have.property('_principalId_hash');

        // Check metadata.timestamp is preserved
        expect(result.metadata.timestamp).to.equal('2023-01-01');
      });

      it('should handle mix of underscored and non-underscored PII fields', () => {
        const input = {
          userId: '123',
          _email: 'user@example.com',
          principalId: 'principal-xyz',
          _phone: '555-1234'
        };

        const result = sanitizePII(input);

        expect(result).to.have.property('userId_hash');
        expect(result).to.have.property('_email_hash');
        expect(result).to.have.property('principalId_hash');
        expect(result).to.have.property('_phone_hash');
        expect(result).to.not.have.property('userId');
        expect(result).to.not.have.property('_email');
        expect(result).to.not.have.property('principalId');
        expect(result).to.not.have.property('_phone');
      });
    });
  });

  describe('getPIIFieldNames', () => {
    it('should return an array of PII field names', () => {
      const fields = getPIIFieldNames();

      expect(fields).to.be.an('array');
      expect(fields).to.include('userId');
      expect(fields).to.include('email');
      expect(fields).to.include('phone');
      expect(fields).to.include('ssn');
      expect(fields).to.include('principalId');
      expect(fields).to.include('emailSanitized');
    });
  });
});
