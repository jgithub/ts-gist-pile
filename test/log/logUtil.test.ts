import { expect } from 'chai';
import { d4l, safeStringify, dateUtil } from "../../src/index";


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
        // expect(d4l(obj)).to.eql('asdf')
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
})