import { expect } from 'chai';
import { d4l, d4lPii, d4lObfuscate, safeStringify, dateUtil } from "../../src/index";
import { resetEnvVarCache } from '../../src/env/environmentUtil';


describe('logUtil', () => {
  describe('.d4l()', () => {
    // describe('when an object has toJSON(): string available', () => {
    //   it('uses it', () => {
    //     const obj = {
    //       toJSON: () => {
    //         return JSON.stringify({a:1})
    //       }
    //     }
    //     expect(d4l(obj)).to.eql('{"a":1}')
    //   })
    // })

    describe('when using a string that already has quotes', () => {
      it('does something', () => {
        expect(d4l(`"already has quotes"`)).to.eql(`'"already has quotes"' (string, 20)`)
      })  
    })

    describe('when an object has toJSON() available', () => {
      it('uses it', () => {
        const obj = {
          toJSON: () => {
            return `"\"already has quotes\"" (object)`
          }
        }
      })
    })    

    describe('when an object looks kinda like KpStat', () => {
      it('uses it', () => {
        const obj = {
          asJson: (): any => {
            return {a:1}
          },
          // toJSON: (): string => {
          //   return JSON.stringify({a:1})
          // }
        }

        // TODO:  Fix this.
        expect(obj.asJson()).to.eql({ a: 1 })

        expect(d4l(obj)).to.eql(`{"a":1}`)
      })  
    })

    describe('when an object has asJson() available', () => {
      it('uses it', () => {
        const obj = {
          asJson: () => {
            return {a:1}
          }
        }
        expect(d4l(obj)).to.eql('{"a":1}')
      })  
    })

    describe('when its an array', () => {
      describe('when its three or more items in length', () => {
        it('talks about the endpoints', () => {
          const obj = [1,2,3]
          expect(d4l(obj)).to.eql('Array(len=3) [1 (number), …, 3 (number)]')
        }) 
      })  
      
      describe('when its a 2-item array', () => {
        it('uses it', () => {
          const obj = ['hello', 'goodbye']
          expect(d4l(obj)).to.eql(`Array(len=2) ['hello' (string, 5), 'goodbye' (string, 7)]`)
        }) 
      }) 

      describe('when its a 1-item array', () => {
        it('uses it', () => {
          const obj = ['just one']
          expect(d4l(obj)).to.eql(`Array(len=1) ['just one' (string, 8)]`)
        }) 
      })
    })

    describe('when an object IS A RegExp', () => {
      it('works', () => {
        const obj = new RegExp("^[01]\d{11}$")
        expect(d4l(obj)).to.eql('/^[01]d{11}$/ (RegExp)')
      })  
    })  
    
    describe('when an object HAS A RegExp', () => {
      it('works', () => {
        const obj = { a: new RegExp("^[01]\d{11}$") }
        expect(d4l(obj)).to.eql('{"a":"/^[01]d{11}$/"} (object)')
      })  
    })

    describe('when the input is a multiline string and considering the joinLines option', () => {
      it('can join it', () => {
        const input = `SELECT * 
FROM table WHERE id = 1`
        expect(d4l(input)).to.eql(`'SELECT * 
FROM table WHERE id = 1' (string, 33)`)
        expect(d4l(input, { joinLines: false })).to.eql(`'SELECT * 
FROM table WHERE id = 1' (string, 33)`)
        expect(d4l(input, { joinLines: true })).to.eql(`'SELECT *  FROM table WHERE id = 1' (string, 33)`)
      })  
    })

    describe('when an object is an Error', () => {
      it('works', () => {
        const myError = new Error("my error");
        expect(d4l(myError).startsWith("Error: my error")).to.be.true
      })  
    })    
  })  

  describe('.safeStringify()', () => {
    it('works', () => {
      expect(safeStringify({ toJSON: () => { throw new Error() } })).to.be.undefined
    })
  });

  describe('.d4lPii()', () => {
    const originalHashSecret = process.env.LOG_HASH_SECRET;
    const originalEagerSanitize = process.env.LOG_EAGER_AUTO_SANITIZE;

    afterEach(() => {
      // Restore original environment
      if (originalHashSecret) {
        process.env.LOG_HASH_SECRET = originalHashSecret;
      } else {
        delete process.env.LOG_HASH_SECRET;
      }
      if (originalEagerSanitize) {
        process.env.LOG_EAGER_AUTO_SANITIZE = originalEagerSanitize;
      } else {
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
      }
      resetEnvVarCache();
    });

    describe('when LOG_HASH_SECRET is NOT set', () => {
      beforeEach(() => {
        delete process.env.LOG_HASH_SECRET;
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
        resetEnvVarCache();
      });

      it('should behave like d4l for strings', () => {
        const input = 'user-12345';
        const result = d4lPii(input);
        expect(result).to.equal(d4l(input));
        expect(result).to.equal("'user-12345' (string, 10)");
      });

      it('should behave like d4l for numbers', () => {
        const input = 42;
        const result = d4lPii(input);
        expect(result).to.equal(d4l(input));
        expect(result).to.equal("42 (number)");
      });

      it('should behave like d4l for booleans', () => {
        const input = true;
        const result = d4lPii(input);
        expect(result).to.equal(d4l(input));
        expect(result).to.equal("TRUE (boolean)");
      });

      it('should behave like d4l for objects', () => {
        const input = { userId: '123', email: 'test@example.com' };
        const result = d4lPii(input);
        expect(result).to.equal(d4l(input));
        expect(result).to.include('"userId":"123"');
        expect(result).to.include('"email":"test@example.com"');
      });

      it('should behave like d4l for null', () => {
        const result = d4lPii(null);
        expect(result).to.equal(d4l(null));
        expect(result).to.equal("<null> (null)");
      });

      it('should behave like d4l for undefined', () => {
        const result = d4lPii(undefined);
        expect(result).to.equal(d4l(undefined));
        expect(result).to.equal("<undefined> (undefined)");
      });
    });

    describe('when LOG_HASH_SECRET is SET', () => {
      beforeEach(() => {
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
        resetEnvVarCache();
      });

      it('should obfuscate strings (with hash for long strings)', () => {
        const input = 'user-12345';
        const result = d4lPii(input);

        // 10 chars -> fully obfuscated, no hash (hash only for strings > 10 chars)
        expect(result).to.not.equal(d4l(input));
        expect(result).to.not.include('user-12345');
        expect(result).to.equal('****');

        // Longer string should have hash
        const longInput = 'user-123456';  // 11 chars
        const longResult = d4lPii(longInput);
        expect(longResult).to.include('(hashed=');
        expect(longResult).to.match(/\*\*\*\*56 \(hashed=[a-f0-9]{12}\)$/);
      });

      it('should pass through numbers unchanged', () => {
        const input = 12345;
        const result = d4lPii(input);

        // Non-strings pass through unchanged (like d4l)
        expect(result).to.equal(d4l(input));
        expect(result).to.equal('12345 (number)');
      });

      it('should pass through booleans unchanged', () => {
        const input = true;
        const result = d4lPii(input);

        // Non-strings pass through unchanged (like d4l)
        expect(result).to.equal(d4l(input));
        expect(result).to.equal('TRUE (boolean)');
      });

      it('should pass through objects unchanged', () => {
        const input = { userId: '123', email: 'test@example.com' };
        const result = d4lPii(input);

        // Non-strings pass through unchanged (like d4l)
        expect(result).to.equal(d4l(input));
        expect(result).to.include('userId');
        expect(result).to.include('test@example.com');
      });

      it('should create consistent obfuscation for same input', () => {
        const input = 'user-12345-abc';  // 14 chars to get hash
        const result1 = d4lPii(input);
        const result2 = d4lPii(input);

        expect(result1).to.equal(result2);
        expect(result1).to.include('(hashed=');
      });

      it('should create different hashes for different inputs', () => {
        const input1 = 'user-12345-abc';  // 14 chars to get hash
        const input2 = 'user-67890-xyz';  // 14 chars to get hash
        const result1 = d4lPii(input1);
        const result2 = d4lPii(input2);

        expect(result1).to.not.equal(result2);
        // Extract hashes
        const hash1 = result1.match(/hashed=([a-f0-9]{12})/)?.[1];
        const hash2 = result2.match(/hashed=([a-f0-9]{12})/)?.[1];
        expect(hash1).to.not.equal(hash2);
      });

      it('should handle null', () => {
        const result = d4lPii(null);
        // null passes through (like d4l)
        expect(result).to.equal('<null> (null)');
      });

      it('should handle undefined', () => {
        const result = d4lPii(undefined);
        // undefined passes through (like d4l)
        expect(result).to.equal('<undefined> (undefined)');
      });

      it('should handle Error objects', () => {
        const input = new Error('test error message');
        const result = d4lPii(input);

        // Errors pass through (like d4l) - they include the message
        expect(result).to.include('Error: test error message');
        expect(result).to.include('(Error');
      });
    });

    describe('typical usage in log messages', () => {
      beforeEach(() => {
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      });

      it('can be used in template strings', () => {
        const userId = 'user-12345';
        const email = 'john@example.com';

        const logMessage = `User logged in: userId=${d4lPii(userId)}, email=${d4lPii(email)}`;

        expect(logMessage).to.not.include('user-12345');
        expect(logMessage).to.not.include('john@example.com');
        expect(logMessage).to.include('userId=');
        expect(logMessage).to.include('email=');
        expect(logMessage).to.include('(hashed=');
        // Email should use email format
        expect(logMessage).to.include('jo****@example.com');
        // UserId is 10 chars, so fully obfuscated
        expect(logMessage).to.include('userId=****,');
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      });

      it('should handle arrays', () => {
        const input = [1, 2, 3];
        const result = d4lPii(input);
        // Arrays pass through (like d4l)
        expect(result).to.include('Array');
        expect(result).to.equal(d4l(input));
      });

      it('should handle very long strings', () => {
        const input = 'x'.repeat(10000);
        const result = d4lPii(input);
        // Very long strings show last 6 chars + hash
        expect(result).to.match(/\*\*\*\*xxxxxx \(hashed=[a-f0-9]{12}\)$/);
      });

      it('should handle special characters', () => {
        const input = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        const result = d4lPii(input);
        // 29 chars -> last 5, check that it has obfuscation and hash
        expect(result).to.include('****');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\(hashed=[a-f0-9]{12}\)$/);
      });

      it('should handle unicode characters', () => {
        const input = '你好世界🌍🌎🌏';
        const result = d4lPii(input);
        // 10 chars -> no hash (too short)
        expect(result).to.equal('****');
      });

      it('should handle empty strings', () => {
        const input = '';
        const result = d4lPii(input);
        // Empty -> fully obfuscated, no hash
        expect(result).to.equal('****');
      });

      it('should handle whitespace-only strings', () => {
        const input = '   \t\n  ';
        const result = d4lPii(input);
        // 7 chars -> fully obfuscated, no hash
        expect(result).to.equal('****');
      });

      it('should handle numeric strings', () => {
        const input = '1234567890';
        const result = d4lPii(input);
        // 10 digits -> shows last 2 (not detected as CC since CC needs 15-16 digits)
        expect(result).to.equal('****7890');
      });

      it('should handle email addresses', () => {
        const input = 'user@example.com';
        const result = d4lPii(input);
        // Email format
        expect(result).to.match(/us\*\*\*\*@example\.com \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('user@example.com');
      });

      it('should handle phone numbers', () => {
        const input = '+1-555-123-4567';
        const result = d4lPii(input);
        // Phone format -> last 4
        expect(result).to.match(/\*\*\*\*4567 \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('555');
      });

      it('should handle SSN format', () => {
        const input = '123-45-6789';
        const result = d4lPii(input);
        // SSN format -> last 4
        expect(result).to.match(/\*\*\*\*6789 \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('123');
      });

      it('should handle credit card numbers', () => {
        const input = '4532-1234-5678-9012';
        const result = d4lPii(input);
        // CC format with dashes -> last 4
        expect(result).to.match(/\*\*\*\*9012 \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('4532');
      });

      it('should handle multiline strings', () => {
        const input = 'line1\nline2\nline3';
        const result = d4lPii(input);
        // 17 chars -> last 4
        expect(result).to.match(/\*\*\*\*ine3 \(hashed=[a-f0-9]{12}\)$/);
      });

      it('should handle zero', () => {
        const input = 0;
        const result = d4lPii(input);
        // Numbers pass through (like d4l)
        expect(result).to.equal('0 (number)');
      });

      it('should handle negative numbers', () => {
        const input = -42;
        const result = d4lPii(input);
        // Numbers pass through (like d4l)
        expect(result).to.equal('-42 (number)');
      });

      it('should handle false', () => {
        const input = false;
        const result = d4lPii(input);
        // Booleans pass through (like d4l)
        expect(result).to.equal('FALSE (boolean)');
      });

      it('should handle nested objects', () => {
        const input = { user: { id: '123', profile: { email: 'test@example.com' } } };
        const result = d4lPii(input);
        // Objects pass through (like d4l)
        expect(result).to.equal(d4l(input));
        expect(result).to.include('user');
        expect(result).to.include('test@example.com');
      });
    });
  });

  describe('.d4lObfuscate()', () => {
    const originalHashSecret = process.env.LOG_HASH_SECRET;
    const originalEagerSanitize = process.env.LOG_EAGER_AUTO_SANITIZE;

    afterEach(() => {
      // Restore original environment
      if (originalHashSecret) {
        process.env.LOG_HASH_SECRET = originalHashSecret;
      } else {
        delete process.env.LOG_HASH_SECRET;
      }
      if (originalEagerSanitize) {
        process.env.LOG_EAGER_AUTO_SANITIZE = originalEagerSanitize;
      } else {
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
      }
      resetEnvVarCache();
    });

    describe('when LOG_HASH_SECRET is NOT set', () => {
      beforeEach(() => {
        delete process.env.LOG_HASH_SECRET;
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
        resetEnvVarCache();
      });

      describe('basic obfuscation', () => {
      it('should obfuscate strings longer than 36 characters', () => {
        const input = 'a'.repeat(40);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****aaaaaa');
        expect(result).to.not.include('a'.repeat(40));
      });

      it('should obfuscate strings between 26 and 36 characters', () => {
        const input = 'b'.repeat(30);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****bbbbb');
      });

      it('should obfuscate strings between 16 and 26 characters', () => {
        const input = 'c'.repeat(20);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****cccc');
      });

      it('should obfuscate strings between 10 and 16 characters', () => {
        const input = 'd'.repeat(12);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****dd');
      });

      it('should fully obfuscate strings 10 characters or less', () => {
        const input = 'e'.repeat(10);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****');
      });

      it('should fully obfuscate very short strings', () => {
        const input = 'abc';
        const result = d4lObfuscate(input);
        expect(result).to.equal('****');
      });

      it('should handle empty strings', () => {
        const input = '';
        const result = d4lObfuscate(input);
        expect(result).to.equal('****');
      });
    });

    describe('sensitive data obfuscation', () => {
      it('should obfuscate API keys', () => {
        const apiKey = 'fake_live_1234567890abcdefghijklmnopqrstuvwxyz';
        const result = d4lObfuscate(apiKey);
        expect(result).to.equal('****uvwxyz');
        expect(result).to.not.include('fake_live');
        expect(result).to.not.include('1234567890');
      });

      it('should obfuscate access tokens', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
        const result = d4lObfuscate(token);
        expect(result).to.equal('****DkwIn0');
        expect(result).to.not.include('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      });

      it('should obfuscate passwords', () => {
        const password = 'MySecurePassword123!'; // 20 chars -> last 2
        const result = d4lObfuscate(password);
        expect(result).to.equal('****123!');
        expect(result).to.not.include('MySecure');
      });

      it('should obfuscate credit card numbers', () => {
        const cc = '4532123456789012'; // 16 chars -> last 1
        const result = d4lObfuscate(cc);
        expect(result).to.equal('****9012');
        expect(result).to.not.include('4532');
      });

      it('should obfuscate email addresses', () => {
        const email = 'user@example.com';
        const result = d4lObfuscate(email);
        expect(result).to.equal('us****@example.com');
        expect(result).to.not.include('user@');
      });

      it('should obfuscate phone numbers', () => {
        const phone = '+1-555-123-4567'; // 15 chars -> last 1
        const result = d4lObfuscate(phone);
        expect(result).to.equal('****4567');
      });

      it('should obfuscate SSN', () => {
        const ssn = '123-45-6789'; // 11 chars -> last 1
        const result = d4lObfuscate(ssn);
        expect(result).to.equal('****6789');
      });
    });

    describe('non-string types', () => {
      it('should handle numbers without obfuscation', () => {
        const input = 12345;
        const result = d4lObfuscate(input);
        expect(result).to.equal('12345 (number)');
      });

      it('should handle booleans without obfuscation', () => {
        const input = true;
        const result = d4lObfuscate(input);
        expect(result).to.equal('TRUE (boolean)');
      });

      it('should handle null without obfuscation', () => {
        const result = d4lObfuscate(null);
        expect(result).to.equal('<null> (null)');
      });

      it('should handle undefined without obfuscation', () => {
        const result = d4lObfuscate(undefined);
        expect(result).to.equal('<undefined> (undefined)');
      });

      it('should handle arrays without obfuscation', () => {
        const input = [1, 2, 3];
        const result = d4lObfuscate(input);
        expect(result).to.equal('Array(len=3) [1 (number), …, 3 (number)]');
      });

      it('should handle objects without obfuscation', () => {
        const input = { a: 1, b: 2 };
        const result = d4lObfuscate(input);
        expect(result).to.include('"a":1');
        expect(result).to.include('"b":2');
        expect(result).to.include('(object)');
      });

      it('should handle Error objects without obfuscation', () => {
        const error = new Error('test error');
        const result = d4lObfuscate(error);
        expect(result).to.include('Error: test error');
      });

      it('should handle Date objects', () => {
        const date = new Date('2023-01-01T00:00:00.000Z');
        const result = d4lObfuscate(date);
        expect(result).to.equal('2023-01-01T00:00:00.000Z');
      });

      it('should handle RegExp objects', () => {
        const regex = /test/gi;
        const result = d4lObfuscate(regex);
        expect(result).to.include('(RegExp)');
      });
    });

    describe('edge cases', () => {
      it('should handle unicode characters', () => {
        const input = '你好世界这是一个很长的字符串'; // 14 chars -> last 2
        const result = d4lObfuscate(input);
        expect(result).to.equal('****符串');
      });

      it('should handle emojis', () => {
        const input = '🔐🔑🗝️🔓🔒🔏🔐🔑🗝️🔓🔒🔏';
        const result = d4lObfuscate(input);
        expect(result).to.equal('****🔒🔏');
      });

      it('should handle mixed unicode and ASCII', () => {
        const input = 'password密码password密码password'; // 28 chars -> last 5
        const result = d4lObfuscate(input);
        expect(result).to.equal('****sword');
      });

      it('should handle newlines', () => {
        const input = 'line1\nline2\nline3\nline4\nline5'; // 29 chars -> last 3
        const result = d4lObfuscate(input);
        expect(result).to.equal('****line5');
      });

      it('should handle tabs', () => {
        const input = 'column1\tcolumn2\tcolumn3\tcolumn4'; // 31 chars -> last 5
        const result = d4lObfuscate(input);
        expect(result).to.equal('****lumn4');
      });

      it('should handle special characters', () => {
        const input = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'; // 29 chars -> last 5
        const result = d4lObfuscate(input);
        expect(result).to.equal('****>?/~`');
      });

      it('should preserve last 6 for exactly 37 chars', () => {
        const input = 'a'.repeat(37);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****aaaaaa');
      });

      it('should preserve last 5 for exactly 27 chars', () => {
        const input = 'b'.repeat(27);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****bbbbb');
      });

      it('should preserve last 4 for exactly 17 chars', () => {
        const input = 'c'.repeat(17);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****cccc');
      });

      it('should preserve last 2 for exactly 11 chars', () => {
        const input = 'd'.repeat(11);
        const result = d4lObfuscate(input);
        expect(result).to.equal('****dd');
      });
    });

    describe('real-world scenarios', () => {
      it('should obfuscate AWS access key', () => {
        const key = 'AKIAIOSFODNN7EXAMPLE'; // 20 chars -> last 2
        const result = d4lObfuscate(key);
        expect(result).to.equal('****MPLE');
        expect(result).to.not.include('AKIAIOSFODNN7');
      });

      it('should obfuscate AWS secret key', () => {
        const secret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
        const result = d4lObfuscate(secret);
        expect(result).to.equal('****PLEKEY');
        expect(result).to.not.include('wJalrXUtnFEMI');
      });

      it('should obfuscate GitHub personal access token', () => {
        const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
        const result = d4lObfuscate(token);
        expect(result).to.equal('****uvwxyz');
        expect(result).to.not.include('ghp_');
      });

      it('should obfuscate database connection string', () => {
        const connStr = 'mongodb://user:password@localhost:27017/database';
        const result = d4lObfuscate(connStr);
        expect(result).to.equal('****tabase');
        expect(result).to.not.include('password');
      });

      it('should obfuscate JWT token', () => {
        const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const result = d4lObfuscate(jwt);
        expect(result).to.equal('****Qssw5c');
        expect(result).to.not.include('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      });

      it('should obfuscate private SSH key preview', () => {
        const sshKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1234567890abcdef';
        const result = d4lObfuscate(sshKey);
        expect(result).to.equal('****abcdef');
        expect(result).to.not.include('BEGIN RSA PRIVATE KEY');
      });
    });

    describe('typical usage in log messages', () => {
      it('can be used in template strings', () => {
        const apiKey = 'fake_live_1234567890abcdefghijklmnopqrstuvwxyz'; // 45 chars -> last 6
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // 36 chars -> last 5

        const logMessage = `API request: key=${d4lObfuscate(apiKey)}, token=${d4lObfuscate(token)}`;

        expect(logMessage).to.include('key=****uvwxyz');
        expect(logMessage).to.include('token=****XVCJ9');
        expect(logMessage).to.not.include('fake_live');
        expect(logMessage).to.not.include('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      });

      it('can obfuscate user credentials in debug logs', () => {
        const username = 'john.doe@example.com'; // email format
        const password = 'MySecurePassword123!'; // 20 chars -> last 4

        const logMessage = `Login attempt: user=${d4lObfuscate(username)}, pass=${d4lObfuscate(password)}`;

        expect(logMessage).to.include('user=jo****@example.com');
        expect(logMessage).to.include('pass=****123!');
        expect(logMessage).to.not.include('john.doe@');
        expect(logMessage).to.not.include('MySecurePassword');
      });

      it('can obfuscate payment information', () => {
        const cardNumber = '4532123456789012'; // credit card format -> last 4
        const cvv = '123'; // 3 chars -> ****

        const logMessage = `Processing payment: card=${d4lObfuscate(cardNumber)}, cvv=${d4lObfuscate(cvv)}`;

        expect(logMessage).to.include('card=****9012');
        expect(logMessage).to.include('cvv=****');
        expect(logMessage).to.not.include('4532');
      });
    });

    describe('comparison with d4l', () => {
      it('should differ from d4l for long strings', () => {
        const input = 'this is a very long string that should be obfuscated';
        const d4lResult = d4l(input);
        const obfuscateResult = d4lObfuscate(input);

        expect(d4lResult).to.include(input);
        expect(obfuscateResult).to.not.include('this is a very long');
        expect(obfuscateResult).to.equal('****scated');
      });

      it('should have same behavior as d4l for numbers', () => {
        const input = 42;
        expect(d4lObfuscate(input)).to.equal(d4l(input));
      });

      it('should have same behavior as d4l for booleans', () => {
        const input = false;
        expect(d4lObfuscate(input)).to.equal(d4l(input));
      });

      it('should have same behavior as d4l for objects', () => {
        const input = { a: 1 };
        expect(d4lObfuscate(input)).to.equal(d4l(input));
      });

      it('should have same behavior as d4l for arrays', () => {
        const input = [1, 2, 3];
        expect(d4lObfuscate(input)).to.equal(d4l(input));
      });
    });
    }); // end "when LOG_HASH_SECRET is NOT set"

    describe('when LOG_HASH_SECRET is SET', () => {
      beforeEach(() => {
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
        resetEnvVarCache();
      });

      it('should obfuscate AND hash strings', () => {
        const input = 'fake_live_1234567890abcdefghijklmnopqrstuvwxyz';
        const result = d4lObfuscate(input);

        // Should have obfuscated part
        expect(result).to.include('****uvwxyz');
        // Should have hash part
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*uvwxyz \(hashed=[a-f0-9]{12}\)$/);
        // Should not include the full sensitive value
        expect(result).to.not.include('fake_live_1234567890');
      });

      it('should provide consistent hashes for same input', () => {
        const input = 'user-12345-longer'; // 17 chars -> last 4, with hash
        const result1 = d4lObfuscate(input);
        const result2 = d4lObfuscate(input);

        expect(result1).to.equal(result2);
        expect(result1).to.match(/\*\*\*\*nger \(hashed=[a-f0-9]{12}\)$/);
      });

      it('should provide different hashes for different inputs', () => {
        const input1 = 'secret-value-abc';
        const input2 = 'secret-value-xyz';
        const result1 = d4lObfuscate(input1);
        const result2 = d4lObfuscate(input2);

        expect(result1).to.not.equal(result2);
        // Extract hashes
        const hash1 = result1.match(/hashed=([a-f0-9]{12})/)?.[1];
        const hash2 = result2.match(/hashed=([a-f0-9]{12})/)?.[1];
        expect(hash1).to.not.equal(hash2);
      });

      it('should obfuscate and hash passwords', () => {
        const password = 'MySecurePassword123!'; // 20 chars -> last 4
        const result = d4lObfuscate(password);

        expect(result).to.include('****123!');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*123! \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('MySecure');
      });

      it('should obfuscate and hash API keys', () => {
        const apiKey = 'AKIAIOSFODNN7EXAMPLE'; // 20 chars -> last 4
        const result = d4lObfuscate(apiKey);

        expect(result).to.include('****MPLE');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*MPLE \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('AKIAIOSFODNN7');
      });

      it('should obfuscate and hash credit card numbers', () => {
        const cc = '4532123456789012'; // credit card format -> last 4
        const result = d4lObfuscate(cc);

        expect(result).to.include('****9012');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*9012 \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('4532');
      });

      it('should obfuscate and hash email addresses', () => {
        const email = 'user@example.com'; // email format
        const result = d4lObfuscate(email);

        expect(result).to.include('us****@example.com');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/us\*\*\*\*@example\.com \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('user@');
      });

      it('should obfuscate and hash SSN', () => {
        const ssn = '123-45-6789'; // SSN format -> last 4
        const result = d4lObfuscate(ssn);

        expect(result).to.include('****6789');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*6789 \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('123-45');
      });

      it('should handle very short strings', () => {
        const input = 'abc';
        const result = d4lObfuscate(input);

        expect(result).to.equal('****');
        // Short strings get fully obfuscated, no hash needed since nothing visible
      });

      it('should handle empty strings', () => {
        const input = '';
        const result = d4lObfuscate(input);

        expect(result).to.equal('****');
      });

      it('should handle long JWT tokens', () => {
        const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const result = d4lObfuscate(jwt);

        expect(result).to.include('****Qssw5c');
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*Qssw5c \(hashed=[a-f0-9]{12}\)$/);
        expect(result).to.not.include('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      });

      it('should NOT hash non-string types', () => {
        // Numbers
        expect(d4lObfuscate(12345)).to.equal('12345 (number)');
        expect(d4lObfuscate(12345)).to.not.include('hashed=');

        // Booleans
        expect(d4lObfuscate(true)).to.equal('TRUE (boolean)');
        expect(d4lObfuscate(true)).to.not.include('hashed=');

        // Arrays
        const arrResult = d4lObfuscate([1, 2, 3]);
        expect(arrResult).to.equal('Array(len=3) [1 (number), …, 3 (number)]');
        expect(arrResult).to.not.include('hashed=');

        // Objects
        const objResult = d4lObfuscate({ a: 1 });
        expect(objResult).to.include('"a":1');
        expect(objResult).to.not.include('hashed=');
      });

      describe('typical usage scenarios', () => {
        it('can correlate obfuscated values across log entries', () => {
          const userId = 'user-12345';

          // Same userId logged in different contexts
          const login = `Login: ${d4lObfuscate(userId)}`;
          const action = `Action: ${d4lObfuscate(userId)}`;

          // Both should have same hash for correlation
          const loginHash = login.match(/hashed=([a-f0-9]{12})/)?.[1];
          const actionHash = action.match(/hashed=([a-f0-9]{12})/)?.[1];

          expect(loginHash).to.equal(actionHash);
          expect(login).to.not.include('user-12345');
          expect(action).to.not.include('user-12345');
        });

        it('provides both quick readability and correlation ability', () => {
          const apiKey = 'fake_live_1234567890abcdefghijklmnopqrstuvwxyz';
          const result = d4lObfuscate(apiKey);

          // Quick readability: can see it ends with 'wxyz'
          expect(result).to.include('****uvwxyz');

          // Correlation ability: has consistent hash
          expect(result).to.match(/hashed=[a-f0-9]{12}/);

          // Security: doesn't expose the actual secret
          expect(result).to.not.include('fake_live_1234567890');
        });

        it('works well in log messages', () => {
          const email = 'john.doe@example.com'; // email format
          const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // 43 chars -> last 6

          const logMessage = `API call from ${d4lObfuscate(email)} with ${d4lObfuscate(token)}`;

          // Should have obfuscated endings
          expect(logMessage).to.include('jo****@example.com');
          expect(logMessage).to.include('****pXVCJ9');

          // Should have hashes for correlation
          expect(logMessage).to.match(/hashed=[a-f0-9]{12}/g);

          // Should not expose sensitive data
          expect(logMessage).to.not.include('john.doe@');
          expect(logMessage).to.not.include('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        });
      });
    });
  });
})