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
    // The contract: d4lPii NEVER returns a person's identifying value in plaintext. Until 0.0.334 it returned d4l(input)
    // whenever LOG_HASH_SECRET was unset, and for every non-string input even when it was set.
    const originalHashSecret = process.env.LOG_HASH_SECRET;
    const originalEagerSanitize = process.env.LOG_EAGER_AUTO_SANITIZE;

    afterEach(() => {
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

      it('redacts strings instead of printing them, without a hash', () => {
        const result = d4lPii('john.smith@example.com');
        expect(result).to.not.include('john.smith');
        expect(result).to.equal('jo****@example.com');
      });

      it('redacts numbers', () => {
        expect(d4lPii(5551234567)).to.not.include('5551234567');
      });

      it('redacts every string in an array', () => {
        const result = d4lPii(['alice.anderson@example.com', 'bob.brown@example.com']);
        expect(result).to.not.include('alice.anderson');
        expect(result).to.not.include('bob.brown');
        expect(result).to.match(/^Array\(len=2\) \[/);
      });

      it('redacts every value of an object, whatever its key is called', () => {
        const result = d4lPii({ to: 'carol.carter@example.com', nested: { who: 'Dave Example' } });
        expect(result).to.not.include('carol.carter');
        expect(result).to.not.include('Dave Example');
        expect(result).to.include('to:');
        expect(result).to.include('who:');
      });

      it('redacts the message of an Error', () => {
        const result = d4lPii(new Error('delivery failed for erin.evans@example.com'));
        expect(result).to.not.include('erin.evans');
        expect(result).to.include('Error');
      });

      it('formats null, undefined and booleans like d4l, since they identify nobody', () => {
        expect(d4lPii(null)).to.equal('<null> (null)');
        expect(d4lPii(undefined)).to.equal('<undefined> (undefined)');
        expect(d4lPii(true)).to.equal('TRUE (boolean)');
      });

      it('survives an object that refers to itself', () => {
        const cyclic: any = { email: 'frank.foster@example.com' };
        cyclic.self = cyclic;
        const result = d4lPii(cyclic);
        expect(result).to.not.include('frank.foster');
        expect(result).to.include('<cycle>');
      });
    });

    describe('when LOG_HASH_SECRET is SET', () => {
      beforeEach(() => {
        delete process.env.LOG_EAGER_AUTO_SANITIZE;
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
        resetEnvVarCache();
      });

      it('obfuscates strings like d4lObfuscate, with a hash for strings longer than 10', () => {
        expect(d4lPii('user-12345')).to.equal('****');
        expect(d4lPii('user-123456')).to.match(/\*\*\*\*56 \(hashed=[a-f0-9]{12}\)$/);
        expect(d4lPii('user@example.com')).to.match(/us\*\*\*\*@example\.com \(hashed=[a-f0-9]{12}\)$/);
      });

      it('creates the same output for the same input and different hashes for different inputs', () => {
        const result1 = d4lPii('user-12345-abc');
        expect(d4lPii('user-12345-abc')).to.equal(result1);
        const hash1 = result1.match(/hashed=([a-f0-9]{12})/)?.[1];
        const hash2 = d4lPii('user-67890-xyz').match(/hashed=([a-f0-9]{12})/)?.[1];
        expect(hash1).to.not.equal(undefined);
        expect(hash1).to.not.equal(hash2);
      });

      it('hashes strings inside arrays and objects too', () => {
        const arrayResult = d4lPii(['alice.anderson@example.com']);
        expect(arrayResult).to.not.include('alice.anderson');
        expect(arrayResult).to.match(/\(hashed=[a-f0-9]{12}\)/);

        const objectResult = d4lPii({ to: 'carol.carter@example.com' });
        expect(objectResult).to.not.include('carol.carter');
        expect(objectResult).to.match(/\(hashed=[a-f0-9]{12}\)/);
      });

      it('never includes the secret itself', () => {
        expect(d4lPii('john.smith@example.com')).to.not.include('test-secret-key-123');
      });

      it('can be used in template strings', () => {
        const logMessage = `User logged in: userId=${d4lPii('user-12345')}, email=${d4lPii('john@example.com')}`;
        expect(logMessage).to.not.include('user-12345');
        expect(logMessage).to.not.include('john@example.com');
        expect(logMessage).to.include('jo****@example.com (hashed=');
        expect(logMessage).to.include('userId=****,');
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
        const apiKey = 'test_fake_1234567890abcdefghijklmnopqrstuvwxyz';
        const result = d4lObfuscate(apiKey);
        expect(result).to.equal('****uvwxyz');
        expect(result).to.not.include('test_fake');
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
      // 0.0.334: blur ALWAYS obfuscates. Until then numbers, arrays of numbers, objects and Errors passed through (#109).
      it('masks numbers: a card or account number is still a credential', () => {
        const result = d4lObfuscate(12345);
        expect(result).to.equal('****');
        expect(result).to.not.include('12345');
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

      it('masks every element of an array, keeping its shape', () => {
        const result = d4lObfuscate([1, 2, 3]);
        expect(result).to.equal('Array(len=3) [****, …, ****]');
      });

      it('masks every value of an object, whatever its key, keeping field names', () => {
        const result = d4lObfuscate({ a: 1, b: 2 });
        expect(result).to.equal('{ a: ****, b: **** } (object)');
      });

      it('masks a key that is not a field name, such as an email address', () => {
        const result = d4lObfuscate({ 'bob@example.com': 'x' });
        expect(result).to.equal('{ bo****@example.com: **** } (object)');
        expect(result).to.not.include('bob@');
      });

      it("masks an Error's message and leaves out its stack", () => {
        const error = new Error('token sk_live_1234567890 rejected');
        const result = d4lObfuscate(error);
        expect(result).to.match(/^Error: \*\*\*\*.* \(Error\)$/);
        expect(result).to.not.include('sk_live_1234567890');
        expect(result).to.not.include('    at ');
      });

      it('masks a Date like the string it is', () => {
        const result = d4lObfuscate(new Date('2023-01-01T00:00:00.000Z'));
        expect(result).to.equal('****000Z');
      });

      it('masks Map values, keeping field-name keys', () => {
        const result = d4lObfuscate(new Map([['k', 'secret-value-123']]));
        expect(result).to.equal('Map(size=1) { k => ****23 }');
        expect(result).to.not.include('secret-value');
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
        const apiKey = 'test_fake_1234567890abcdefghijklmnopqrstuvwxyz'; // 45 chars -> last 6
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // 36 chars -> last 5

        const logMessage = `API request: key=${d4lObfuscate(apiKey)}, token=${d4lObfuscate(token)}`;

        expect(logMessage).to.include('key=****uvwxyz');
        expect(logMessage).to.include('token=****XVCJ9');
        expect(logMessage).to.not.include('test_fake');
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

      it('differs from d4l for numbers: d4l prints them, blur masks them', () => {
        expect(d4l(42)).to.equal('42 (number)');
        expect(d4lObfuscate(42)).to.equal('****');
      });

      it('should have same behavior as d4l for booleans', () => {
        const input = false;
        expect(d4lObfuscate(input)).to.equal(d4l(input));
      });

      it('differs from d4l for objects and arrays: blur masks every value', () => {
        expect(d4l({ a: 1 })).to.include('"a":1');
        expect(d4lObfuscate({ a: 1 })).to.equal('{ a: **** } (object)');
        expect(d4lObfuscate([1, 2, 3])).to.equal('Array(len=3) [****, …, ****]');
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
        const input = 'test_fake_1234567890abcdefghijklmnopqrstuvwxyz';
        const result = d4lObfuscate(input);

        // Should have obfuscated part
        expect(result).to.include('****uvwxyz');
        // Should have hash part
        expect(result).to.include('(hashed=');
        expect(result).to.match(/\*\*\*\*uvwxyz \(hashed=[a-f0-9]{12}\)$/);
        // Should not include the full sensitive value
        expect(result).to.not.include('test_fake_1234567890');
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

      it('masks non-string values too, hashing those longer than 10 characters as it does strings', () => {
        // Short values: masked, no hash (as for short strings)
        expect(d4lObfuscate(12345)).to.equal('****');
        expect(d4lObfuscate([1, 2, 3])).to.equal('Array(len=3) [****, …, ****]');
        expect(d4lObfuscate({ a: 1 })).to.equal('{ a: **** } (object)');

        // Booleans carry nothing and are formatted as d4l() formats them
        expect(d4lObfuscate(true)).to.equal('TRUE (boolean)');

        // A long number is masked AND hashed, so two log lines about it correlate
        const longNumber = d4lObfuscate(4111111111111111);
        expect(longNumber).to.match(/^\*\*\*\*1111 \(hashed=[a-f0-9]{12}\)$/);
        expect(longNumber).to.not.include('411111');
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
          const apiKey = 'test_fake_1234567890abcdefghijklmnopqrstuvwxyz';
          const result = d4lObfuscate(apiKey);

          // Quick readability: can see it ends with 'wxyz'
          expect(result).to.include('****uvwxyz');

          // Correlation ability: has consistent hash
          expect(result).to.match(/hashed=[a-f0-9]{12}/);

          // Security: doesn't expose the actual secret
          expect(result).to.not.include('test_fake_1234567890');
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

  // #109's review: pii() printed an object KEY in plaintext, so pii({ [email]: x }) leaked the address it was asked to hide.
  describe('d4lPii on keys that identify someone', () => {
    it('masks an email-address key and keeps field-name keys', () => {
      const result = d4lPii({ 'bob@example.com': 'x', status: 'invited' });
      expect(result).to.equal('{ bo****@example.com: ****, status: **** } (object)');
      expect(result).to.not.include('bob@');
    });
  });
})
