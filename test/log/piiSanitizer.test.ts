import { expect } from 'chai';
import { sanitizePII, isPIISecureModeEnabled, getPIIFieldNames, eagerSanitizePII } from '../../src/log/piiSanitizer';

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

      it('should handle case-agnostic field names: USER_ID variations', () => {
        const input = {
          USER_ID: '1',
          User_Id: '2',
          user_id: '3',
          UserId: '4',
          userId: '5',
          USERID: '6'
        };

        const result = sanitizePII(input);

        // All variations should be hashed
        expect(result).to.have.property('USER_ID_hash');
        expect(result).to.have.property('User_Id_hash');
        expect(result).to.have.property('user_id_hash');
        expect(result).to.have.property('UserId_hash');
        expect(result).to.have.property('userId_hash');
        expect(result).to.have.property('USERID_hash');

        // None of the original fields should remain
        expect(result).to.not.have.property('USER_ID');
        expect(result).to.not.have.property('User_Id');
        expect(result).to.not.have.property('user_id');
        expect(result).to.not.have.property('UserId');
        expect(result).to.not.have.property('userId');
        expect(result).to.not.have.property('USERID');
      });

      it('should handle case-agnostic field names: USERNAME variations', () => {
        const input = {
          USERNAME: 'alice',
          UserName: 'bob',
          username: 'charlie',
          UsERnaME: 'dave'
        };

        const result = sanitizePII(input);

        expect(result).to.have.property('USERNAME_hash');
        expect(result).to.have.property('UserName_hash');
        expect(result).to.have.property('username_hash');
        expect(result).to.have.property('UsERnaME_hash');

        expect(result).to.not.have.property('USERNAME');
        expect(result).to.not.have.property('UserName');
        expect(result).to.not.have.property('username');
        expect(result).to.not.have.property('UsERnaME');
      });

      it('should handle case-agnostic with underscores: _user_Id variations', () => {
        const input = {
          _USER_ID: '1',
          _User_Id: '2',
          _user_id: '3',
          _UserId: '4',
          _userId: '5'
        };

        const result = sanitizePII(input);

        expect(result).to.have.property('_USER_ID_hash');
        expect(result).to.have.property('_User_Id_hash');
        expect(result).to.have.property('_user_id_hash');
        expect(result).to.have.property('_UserId_hash');
        expect(result).to.have.property('_userId_hash');

        expect(result).to.not.have.property('_USER_ID');
        expect(result).to.not.have.property('_User_Id');
        expect(result).to.not.have.property('_user_id');
        expect(result).to.not.have.property('_UserId');
        expect(result).to.not.have.property('_userId');
      });

      it('should handle case-agnostic EMAIL variations', () => {
        const input = {
          EMAIL: 'test1@example.com',
          Email: 'test2@example.com',
          email: 'test3@example.com',
          EmAiL: 'test4@example.com',
          _EMAIL: 'test5@example.com',
          _email: 'test6@example.com'
        };

        const result = sanitizePII(input);

        expect(result).to.have.property('EMAIL_hash');
        expect(result).to.have.property('Email_hash');
        expect(result).to.have.property('email_hash');
        expect(result).to.have.property('EmAiL_hash');
        expect(result).to.have.property('_EMAIL_hash');
        expect(result).to.have.property('_email_hash');

        expect(result).to.not.have.property('EMAIL');
        expect(result).to.not.have.property('Email');
        expect(result).to.not.have.property('email');
        expect(result).to.not.have.property('EmAiL');
        expect(result).to.not.have.property('_EMAIL');
        expect(result).to.not.have.property('_email');
      });

      it('should handle case-agnostic PRINCIPAL_ID variations', () => {
        const input = {
          PRINCIPAL_ID: 'principal-1',
          Principal_Id: 'principal-2',
          principal_id: 'principal-3',
          PrincipalId: 'principal-4',
          principalId: 'principal-5'
        };

        const result = sanitizePII(input);

        expect(result).to.have.property('PRINCIPAL_ID_hash');
        expect(result).to.have.property('Principal_Id_hash');
        expect(result).to.have.property('principal_id_hash');
        expect(result).to.have.property('PrincipalId_hash');
        expect(result).to.have.property('principalId_hash');

        expect(result).to.not.have.property('PRINCIPAL_ID');
        expect(result).to.not.have.property('Principal_Id');
        expect(result).to.not.have.property('principal_id');
        expect(result).to.not.have.property('PrincipalId');
        expect(result).to.not.have.property('principalId');
      });

      it('should handle case-agnostic nested in _attrs pattern', () => {
        const input = {
          _attrs: {
            USER_ID: '123',
            user_id: '456',
            Email: 'test@example.com',
            PRINCIPAL_ID: 'principal-xyz'
          },
          metadata: {
            UserId: '789',
            USERNAME: 'testuser'
          }
        };

        const result = sanitizePII(input);

        // Check _attrs nested fields are hashed
        expect(result._attrs).to.not.have.property('USER_ID');
        expect(result._attrs).to.have.property('USER_ID_hash');
        expect(result._attrs).to.not.have.property('user_id');
        expect(result._attrs).to.have.property('user_id_hash');
        expect(result._attrs).to.not.have.property('Email');
        expect(result._attrs).to.have.property('Email_hash');
        expect(result._attrs).to.not.have.property('PRINCIPAL_ID');
        expect(result._attrs).to.have.property('PRINCIPAL_ID_hash');

        // Check metadata nested fields are hashed
        expect(result.metadata).to.not.have.property('UserId');
        expect(result.metadata).to.have.property('UserId_hash');
        expect(result.metadata).to.not.have.property('USERNAME');
        expect(result.metadata).to.have.property('USERNAME_hash');
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

  describe('hashPIIValue', () => {
    const { hashPIIValue } = require('../../src/log/piiSanitizer');

    beforeEach(() => {
      process.env.LOG_HASH_SECRET = 'test-secret-key-123';
    });

    afterEach(() => {
      if (originalEnv) {
        process.env.LOG_HASH_SECRET = originalEnv;
      } else {
        delete process.env.LOG_HASH_SECRET;
      }
    });

    it('should hash a string value', () => {
      const result = hashPIIValue('test-value');
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should hash null as "null"', () => {
      const result = hashPIIValue(null);
      expect(result).to.equal('null');
    });

    it('should hash undefined as "null"', () => {
      const result = hashPIIValue(undefined);
      expect(result).to.equal('null');
    });

    it('should create consistent hashes for the same value', () => {
      const value = 'consistent-value';
      const hash1 = hashPIIValue(value);
      const hash2 = hashPIIValue(value);
      expect(hash1).to.equal(hash2);
    });

    it('should create different hashes for different values', () => {
      const hash1 = hashPIIValue('value-1');
      const hash2 = hashPIIValue('value-2');
      expect(hash1).to.not.equal(hash2);
    });

    it('should handle empty string', () => {
      const result = hashPIIValue('');
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle very long strings', () => {
      const longValue = 'x'.repeat(10000);
      const result = hashPIIValue(longValue);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle strings with special characters', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const result = hashPIIValue(specialValue);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle unicode characters', () => {
      const unicodeValue = '你好世界🌍🌎🌏';
      const result = hashPIIValue(unicodeValue);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle email addresses', () => {
      const email = 'user@example.com';
      const result = hashPIIValue(email);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle phone numbers', () => {
      const phone = '+1-555-123-4567';
      const result = hashPIIValue(phone);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle SSN format', () => {
      const ssn = '123-45-6789';
      const result = hashPIIValue(ssn);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should produce different hashes with different secrets', () => {
      process.env.LOG_HASH_SECRET = 'secret1';
      const hash1 = hashPIIValue('test-value');

      process.env.LOG_HASH_SECRET = 'secret2';
      const hash2 = hashPIIValue('test-value');

      expect(hash1).to.not.equal(hash2);
    });

    it('should handle multiline strings', () => {
      const multiline = 'line1\nline2\nline3';
      const result = hashPIIValue(multiline);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle strings with only whitespace', () => {
      const whitespace = '   \t\n  ';
      const result = hashPIIValue(whitespace);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });

    it('should handle numeric strings', () => {
      const numeric = '1234567890';
      const result = hashPIIValue(numeric);
      expect(result).to.be.a('string');
      expect(result).to.have.lengthOf(12);
      expect(result).to.match(/^[a-f0-9]{12}$/);
    });
  });

  describe('eagerSanitizePII', () => {
    it('should always sanitize regardless of LOG_HASH_SECRET', () => {
      delete process.env.LOG_HASH_SECRET;

      const input = {
        password: 'neverguessme',
        username: 'testuser'
      };

      const result = eagerSanitizePII(input);

      // eagerSanitizePII keeps field names but obfuscates values
      expect(result).to.have.property('password');
      expect(result.password).to.not.equal('neverguessme');
      expect(result.password).to.include('****');
      expect(result).to.have.property('username');
      expect(result.username).to.not.equal('testuser');
      expect(result.username).to.include('****');
    });

    it('should redact password field', () => {
      const input = { password: 'neverguessme', other: 'value' };
      const result = eagerSanitizePII(input);

      // Keeps field name, obfuscates value
      expect(result).to.have.property('password');
      expect(result.password).to.not.equal('neverguessme');
      expect(result.password).to.include('****');
      expect(result.other).to.equal('value');
    });

    it('should redact nested SSN', () => {
      const input = {
        nested: {
          ssn: '111-22-5555',
          safe: 'data'
        }
      };
      const result = eagerSanitizePII(input);

      // Keeps field name, obfuscates value
      expect(result.nested).to.have.property('ssn');
      expect(result.nested.ssn).to.not.equal('111-22-5555');
      expect(result.nested.ssn).to.include('****');
      expect(result.nested.safe).to.equal('data');
    });

    it('should redact double nested email', () => {
      const input = {
        double: {
          nested: {
            email: 'john@smith.com',
            metadata: 'preserved'
          }
        }
      };
      const result = eagerSanitizePII(input);

      // Keeps field name, obfuscates value
      expect(result.double.nested).to.have.property('email');
      expect(result.double.nested.email).to.not.equal('john@smith.com');
      expect(result.double.nested.email).to.include('****');
      expect(result.double.nested.metadata).to.equal('preserved');
    });

    it('should redact e_mail with underscore', () => {
      const input = {
        double: {
          nested: {
            e_mail: 'john@smith.com'
          }
        }
      };
      const result = eagerSanitizePII(input);

      // Keeps field name, obfuscates value
      expect(result.double.nested).to.have.property('e_mail');
      expect(result.double.nested.e_mail).to.not.equal('john@smith.com');
      expect(result.double.nested.e_mail).to.include('****');
    });

    it('should redact eMail with camelCase', () => {
      const input = {
        double: {
          nested: {
            eMail: 'john@smith.com'
          }
        }
      };
      const result = eagerSanitizePII(input);

      // Keeps field name, obfuscates value
      expect(result.double.nested).to.have.property('eMail');
      expect(result.double.nested.eMail).to.not.equal('john@smith.com');
      expect(result.double.nested.eMail).to.include('****');
    });

    it('should redact multiple PII fields', () => {
      const input = {
        userId: '12345',
        email: 'user@example.com',
        phone: '555-1234',
        normalField: 'keep-me'
      };

      const result = eagerSanitizePII(input);

      // Keeps field names, obfuscates values
      expect(result).to.have.property('userId');
      expect(result.userId).to.not.equal('12345');
      expect(result.userId).to.include('****');
      expect(result).to.have.property('email');
      expect(result.email).to.not.equal('user@example.com');
      expect(result.email).to.include('****');
      expect(result).to.have.property('phone');
      expect(result.phone).to.not.equal('555-1234');
      expect(result.phone).to.include('****');
      expect(result.normalField).to.equal('keep-me');
    });

    it('should handle arrays', () => {
      const input = {
        users: [
          { userId: '1', email: 'user1@example.com' },
          { userId: '2', email: 'user2@example.com' }
        ]
      };

      const result = eagerSanitizePII(input);

      // Keeps field names, obfuscates values
      expect(result.users[0]).to.have.property('userId');
      expect(result.users[0].userId).to.not.equal('1');
      expect(result.users[0].userId).to.include('****');
      expect(result.users[1]).to.have.property('email');
      expect(result.users[1].email).to.not.equal('user2@example.com');
      expect(result.users[1].email).to.include('****');
    });

    it('should return null for null input', () => {
      expect(eagerSanitizePII(null)).to.be.null;
    });

    it('should return primitives as-is', () => {
      expect(eagerSanitizePII('string')).to.equal('string');
      expect(eagerSanitizePII(123)).to.equal(123);
      expect(eagerSanitizePII(true)).to.equal(true);
    });

    it('should preserve non-PII fields at all levels', () => {
      const input = {
        safe1: 'value1',
        nested: {
          safe2: 'value2',
          ssn: '123-45-6789',
          deep: {
            safe3: 'value3',
            email: 'test@example.com'
          }
        }
      };

      const result = eagerSanitizePII(input);

      expect(result.safe1).to.equal('value1');
      expect(result.nested.safe2).to.equal('value2');
      expect(result.nested.deep.safe3).to.equal('value3');
      // Keeps field names, obfuscates values
      expect(result.nested).to.have.property('ssn');
      expect(result.nested.ssn).to.not.equal('123-45-6789');
      expect(result.nested.ssn).to.include('****');
      expect(result.nested.deep).to.have.property('email');
      expect(result.nested.deep.email).to.not.equal('test@example.com');
      expect(result.nested.deep.email).to.include('****');
    });
  });
});
