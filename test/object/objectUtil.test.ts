import { expect } from 'chai';
import { dateUtil, objectUtil } from "../../src/index";


describe('objectUtil', () => {
  describe('.cloneDeep()', () => {
    describe('based on some common test inputs', () => {
      it('deeply clones', () => {
        const obj = { a: 1, b: "hello", c: { d: 2, e: "world" } }
        const clone = objectUtil.cloneDeep(obj)
        expect(clone).to.eql(obj)
        expect(clone).to.not.eq(obj)
        expect(clone.c).to.not.eq(obj.c)
      })
    })

    describe('when an object contains a date', () => {
      it('works', () => {
        const obj = { a: 1, b: new Date(0) }
        expect(JSON.stringify(obj)).to.eq(`{"a":1,"b":"1970-01-01T00:00:00.000Z"}`)
        expect(typeof (JSON.parse(JSON.stringify(obj)).b)).to.eq('string')

        const clone = objectUtil.cloneDeep(obj)
        expect(clone).to.eql(obj)
        expect(clone).to.not.eq(obj)
        expect(clone.b).to.be.instanceOf(Date)
        expect(typeof (clone.b)).to.eq('object')
        expect(dateUtil.isValidDateObject(clone.b)).to.be.true
        expect(JSON.stringify(clone)).to.eq(`{"a":1,"b":"1970-01-01T00:00:00.000Z"}`)

      })
    })    
  })
})