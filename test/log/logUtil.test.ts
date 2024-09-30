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
        const myError = new Error("my error")
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