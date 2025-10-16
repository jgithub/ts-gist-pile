import { expect } from 'chai';
import { diceUtil } from "../../src/index";


describe('diceUtil', () => {
  describe('.rollOneDie()', () => {
    describe('when rolling a 6-sided die', () => {
      it('returns a value between 1 and 6', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.rollOneDie(6);
          expect(result).to.be.at.least(1);
          expect(result).to.be.at.most(6);
          expect(Number.isInteger(result)).to.be.true;
        }
      })
    })

    describe('when rolling a 20-sided die', () => {
      it('returns a value between 1 and 20', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.rollOneDie(20);
          expect(result).to.be.at.least(1);
          expect(result).to.be.at.most(20);
          expect(Number.isInteger(result)).to.be.true;
        }
      })
    })

    describe('when rolling a 100-sided die', () => {
      it('returns a value between 1 and 100', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.rollOneDie(100);
          expect(result).to.be.at.least(1);
          expect(result).to.be.at.most(100);
          expect(Number.isInteger(result)).to.be.true;
        }
      })
    })

    describe('distribution test', () => {
      it('generates a reasonable distribution over many rolls', () => {
        const numSides = 6;
        const rolls = 6000;
        const counts: { [key: number]: number } = {};

        // Initialize counts
        for (let i = 1; i <= numSides; i++) {
          counts[i] = 0;
        }

        // Roll many times
        for (let i = 0; i < rolls; i++) {
          const result = diceUtil.rollOneDie(numSides);
          counts[result]++;
        }

        // Each side should appear roughly 1000 times (±20%)
        // This is a loose statistical test to verify randomness
        const expectedCount = rolls / numSides;
        const tolerance = expectedCount * 0.2; // 20% tolerance

        for (let i = 1; i <= numSides; i++) {
          expect(counts[i]).to.be.at.least(expectedCount - tolerance);
          expect(counts[i]).to.be.at.most(expectedCount + tolerance);
        }
      })
    })
  })

  describe('.xTimesRollDie()', () => {
    describe('when rolling one 6-sided die once', () => {
      it('returns a value between 1 and 6', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.xTimesRollDie(1, 6);
          expect(result).to.be.at.least(1);
          expect(result).to.be.at.most(6);
        }
      })
    })

    describe('when rolling a 6-sided die 3 times', () => {
      it('returns a value between 3 and 18', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.xTimesRollDie(3, 6);
          expect(result).to.be.at.least(3);
          expect(result).to.be.at.most(18);
          expect(Number.isInteger(result)).to.be.true;
        }
      })
    })

    describe('when rolling a 20-sided die 2 times', () => {
      it('returns a value between 2 and 40', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.xTimesRollDie(2, 20);
          expect(result).to.be.at.least(2);
          expect(result).to.be.at.most(40);
          expect(Number.isInteger(result)).to.be.true;
        }
      })
    })

    describe('when rolling zero times', () => {
      it('returns 0', () => {
        const result = diceUtil.xTimesRollDie(0, 6);
        expect(result).to.equal(0);
      })
    })

    describe('average value test', () => {
      it('generates values with an average near the expected value', () => {
        const numRolls = 3;
        const numSides = 6;
        const iterations = 1000;
        let total = 0;

        for (let i = 0; i < iterations; i++) {
          total += diceUtil.xTimesRollDie(numRolls, numSides);
        }

        const average = total / iterations;
        // Expected average is numRolls * (numSides + 1) / 2
        // For 3d6, that's 3 * 3.5 = 10.5
        const expectedAverage = numRolls * (numSides + 1) / 2;
        const tolerance = expectedAverage * 0.15; // 15% tolerance

        expect(average).to.be.at.least(expectedAverage - tolerance);
        expect(average).to.be.at.most(expectedAverage + tolerance);
      })
    })
  })

  describe('.beTrueXPercentOfTheTime()', () => {
    describe('when percent is 0', () => {
      it('always returns false', () => {
        for (let i = 0; i < 100; i++) {
          expect(diceUtil.beTrueXPercentOfTheTime(0)).to.be.false;
        }
      })
    })

    describe('when percent is 100', () => {
      it('always returns true', () => {
        for (let i = 0; i < 100; i++) {
          expect(diceUtil.beTrueXPercentOfTheTime(100)).to.be.true;
        }
      })
    })

    describe('when percent is 50', () => {
      it('returns true approximately 50% of the time', () => {
        const trials = 1000;
        let trueCount = 0;

        for (let i = 0; i < trials; i++) {
          if (diceUtil.beTrueXPercentOfTheTime(50)) {
            trueCount++;
          }
        }

        const percentage = (trueCount / trials) * 100;
        // Should be around 50%, with some tolerance (±10%)
        expect(percentage).to.be.at.least(40);
        expect(percentage).to.be.at.most(60);
      })
    })

    describe('when percent is 25', () => {
      it('returns true approximately 25% of the time', () => {
        const trials = 1000;
        let trueCount = 0;

        for (let i = 0; i < trials; i++) {
          if (diceUtil.beTrueXPercentOfTheTime(25)) {
            trueCount++;
          }
        }

        const percentage = (trueCount / trials) * 100;
        // Should be around 25%, with some tolerance (±8%)
        expect(percentage).to.be.at.least(17);
        expect(percentage).to.be.at.most(33);
      })
    })

    describe('when percent is 75', () => {
      it('returns true approximately 75% of the time', () => {
        const trials = 1000;
        let trueCount = 0;

        for (let i = 0; i < trials; i++) {
          if (diceUtil.beTrueXPercentOfTheTime(75)) {
            trueCount++;
          }
        }

        const percentage = (trueCount / trials) * 100;
        // Should be around 75%, with some tolerance (±8%)
        expect(percentage).to.be.at.least(67);
        expect(percentage).to.be.at.most(83);
      })
    })

    describe('return type', () => {
      it('always returns a boolean', () => {
        for (let i = 0; i < 100; i++) {
          const result = diceUtil.beTrueXPercentOfTheTime(50);
          expect(typeof result).to.equal('boolean');
        }
      })
    })
  })
})
