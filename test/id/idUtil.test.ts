import { expect } from 'chai';
import { idUtil } from "../../src/index";

describe('idUtil', () => {
  describe('.generateTimeOrderedBase62Id()', () => {
    describe('based on some common test inputs', () => {
      it('does something positive', () => {
        const generatedId = idUtil.generateTimeOrderedBase62Id()
        const anotherGeneratedId = idUtil.generateTimeOrderedBase62Id()

        console.log(`generatedId = ${generatedId}`)
        console.log(`anotherGeneratedId = ${anotherGeneratedId}`)

        expect(generatedId).not.to.be.null;
        expect(generatedId.length).to.be.eq(21);
        expect(generatedId.startsWith('3')).to.be.true
        expect(generatedId.startsWith('30')).to.be.true
        expect(generatedId.startsWith('30I')).to.be.true

        const end1 = generatedId.replace(/^[0-9a-zA-Z]{18}/, '');
        const end2 = anotherGeneratedId.replace(/^[0-9a-zA-Z]{18}/, '');

        expect(end1.length).to.be.eq(3);
        expect(end2.length).to.be.eq(3);


        // entropy is at the end
        expect(end1).not.to.eq(end2); 
      })
    })
  })
})
  