import { expect } from 'chai';
import { d4l, dateUtil } from "../../src/index";


describe('logUtil', () => {
  describe('.d4l()', () => {
    describe('when an object has toJSON(): string available', () => {
      it('uses it', () => {
        const obj = {
          toJSON: () => {
            return JSON.stringify({a:1})
          }
        }
        expect(d4l(obj)).to.eql('{"a":1}')
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
  })  
})