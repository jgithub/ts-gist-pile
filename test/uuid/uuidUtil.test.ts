import { expect } from 'chai';
import { uuidUtil } from "../../src/index";


describe('uuidUtil', () => {
  describe('.generateV7()', () => {
    it('hex alphanumeric are NEVER uppercase', () => {
      expect(uuidUtil.generateV7()).not.to.match(/[A-Z]/);
    })  
  })  
})