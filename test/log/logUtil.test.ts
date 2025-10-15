import { expect } from 'chai';
import { d4l, d4lPii, safeStringify, dateUtil } from "../../src/index";


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
    const originalEnv = process.env.LOG_HASH_SECRET;

    afterEach(() => {
      // Restore original environment
      if (originalEnv) {
        process.env.LOG_HASH_SECRET = originalEnv;
      } else {
        delete process.env.LOG_HASH_SECRET;
      }
    });

    describe('when LOG_HASH_SECRET is NOT set', () => {
      beforeEach(() => {
        delete process.env.LOG_HASH_SECRET;
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
        process.env.LOG_HASH_SECRET = 'test-secret-key-123';
      });

      it('should hash strings instead of showing them', () => {
        const input = 'user-12345';
        const result = d4lPii(input);

        expect(result).to.not.equal(d4l(input));
        expect(result).to.not.include('user-12345');
        expect(result).to.include('(hashed)');
        expect(result).to.match(/^[a-f0-9]{12} \(hashed\)$/);
      });

      it('should hash numbers', () => {
        const input = 12345;
        const result = d4lPii(input);

        expect(result).to.not.equal(d4l(input));
        expect(result).to.not.include('12345');
        expect(result).to.include('(hashed)');
        expect(result).to.match(/^[a-f0-9]{12} \(hashed\)$/);
      });

      it('should hash booleans', () => {
        const input = true;
        const result = d4lPii(input);

        expect(result).to.not.equal(d4l(input));
        expect(result).to.include('(hashed)');
        expect(result).to.match(/^[a-f0-9]{12} \(hashed\)$/);
      });

      it('should hash objects', () => {
        const input = { userId: '123', email: 'test@example.com' };
        const result = d4lPii(input);

        expect(result).to.not.equal(d4l(input));
        expect(result).to.not.include('userId');
        expect(result).to.not.include('test@example.com');
        expect(result).to.include('(hashed)');
        expect(result).to.match(/^[a-f0-9]{12} \(hashed\)$/);
      });

      it('should create consistent hashes for same input', () => {
        const input = 'user-12345';
        const result1 = d4lPii(input);
        const result2 = d4lPii(input);

        expect(result1).to.equal(result2);
      });

      it('should create different hashes for different inputs', () => {
        const input1 = 'user-12345';
        const input2 = 'user-67890';
        const result1 = d4lPii(input1);
        const result2 = d4lPii(input2);

        expect(result1).to.not.equal(result2);
      });

      it('should handle null', () => {
        const result = d4lPii(null);
        expect(result).to.equal('null (hashed)');
      });

      it('should handle undefined', () => {
        const result = d4lPii(undefined);
        expect(result).to.equal('null (hashed)');
      });

      it('should hash Error objects', () => {
        const input = new Error('test error message');
        const result = d4lPii(input);

        expect(result).to.not.include('test error message');
        expect(result).to.include('(hashed)');
        expect(result).to.match(/^[a-f0-9]{12} \(hashed\)$/);
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
        expect(logMessage).to.include('(hashed)');
      });
    });
  });
})