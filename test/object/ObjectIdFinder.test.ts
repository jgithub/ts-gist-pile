import { expect } from 'chai';
import { ObjectIdFinder } from "../../src/index";


describe('ObjectIdFinder', () => {
  describe('.genget()', () => {
    it('it works', () => {
      const myObj = {}
      let finder = ObjectIdFinder.genget(myObj)
      const uuid = finder.getValue()
      expect(uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(finder.isCached()).to.eq(false)
      finder = ObjectIdFinder.genget(myObj)
      expect(finder.isCached()).to.eq(true)
      expect(finder.getValue()).to.eq(uuid)
      expect(ObjectIdFinder.gengetObjectId(myObj)).to.eq(uuid)

    })  
  })  
})