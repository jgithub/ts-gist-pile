import { expect } from 'chai';
import { idUtil } from "../../src/index";

describe('idUtil', () => {
  describe('.generateTimeOrderedBase62Id()', () => {
    describe('based on some common test inputs', () => {
      it('does something positive', () => {
        const generatedId = idUtil.generateTimeOrderedBase62Id()
        const anotherGeneratedId = idUtil.generateTimeOrderedBase62Id()
        const thirdNanoIdLike = idUtil.generateTimeOrderedNanoLikeId()

        console.log(`generatedId = ${generatedId}`)
        console.log(`anotherGeneratedId = ${anotherGeneratedId}`)
        console.log(`thirdNanoIdLike = ${thirdNanoIdLike}`)

        expect(generatedId).not.to.be.null;

        expect(generatedId.length).to.be.eq(21);
        expect(anotherGeneratedId.length).to.be.eq(21);
        expect(thirdNanoIdLike.length).to.be.eq(21);

        // The leading characters encode the CURRENT TIME (uuid v7), so any fixed prefix goes
        // red on a calendar date -- this assertion had been re-pinned three times ('30', '30I',
        // '1av', '1b'...) and failed again on 2026-09-24. What the function promises is
        // TIME-ORDERING: an id minted later sorts after one minted earlier. Assert that.
        // BASE62_ALPHABET is ASCII-ordered (0-9, A-Z, a-z) and uuid v7 is monotonic within a
        // process, so at a fixed length lexical order IS time order.
        expect(generatedId <= anotherGeneratedId, 'later id sorts after earlier id (base62)').to.be.true
        // NOT asserted for the nano-like id: NANOID_ALPHABET ends with '-', which is ASCII-smallest,
        // so those ids are time-ordered numerically but not lexically sortable. A property gap in
        // the alphabet, not in this test; changing the alphabet re-encodes existing ids.


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
  