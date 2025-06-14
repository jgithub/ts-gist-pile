import { expect } from 'chai';
import { dateUtil, cloneUtil } from "../../src/index";


describe('cloneUtil', () => {
  describe('.cloneDeep()', () => {
    describe('based on some common test inputs', () => {
      it('deeply clones', () => {
        const obj = { a: 1, b: "hello", c: { d: 2, e: "world" } }
        const clone = cloneUtil.cloneDeep(obj)
        expect(clone).to.eql(obj)
        expect(clone).to.not.eq(obj)
        expect(clone.c).to.not.eq(obj.c)
      })
    })

    describe('when an object contains a date', () => {
      it('still works', () => {
        const obj = { a: 1, b: new Date(0) }
        expect(JSON.stringify(obj)).to.eq(`{"a":1,"b":"1970-01-01T00:00:00.000Z"}`)
        expect(typeof (JSON.parse(JSON.stringify(obj)).b)).to.eq('string')

        const clone = cloneUtil.cloneDeep(obj)
        expect(clone).to.eql(obj)
        expect(clone).to.not.eq(obj)
        expect(clone.b).to.be.instanceOf(Date)
        expect(typeof (clone.b)).to.eq('object')
        expect(dateUtil.isValidDateObject(clone.b)).to.be.true
        expect(JSON.stringify(clone)).to.eq(`{"a":1,"b":"1970-01-01T00:00:00.000Z"}`)

      })
    })    
  })


  describe('.cloneWithOverrides()', () => {
    describe('based on some common test inputs', () => {
      it('works', () => {
        type User = {
          id: string;
          name: string;
          favoriteColor: string;
        };
        
        const user: User = { id: '1', name: 'Alice', favoriteColor: 'red' };
        const adminUser = cloneUtil.cloneWithOverrides(user, { favoriteColor: 'blue' });
        expect (adminUser).to.eql({ id: '1', name: 'Alice', favoriteColor: 'blue' });
      })
    })
  })
})