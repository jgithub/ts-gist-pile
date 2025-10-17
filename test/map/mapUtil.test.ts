import { expect } from 'chai';
import { getKeys } from '../../src/map/mapUtil';

describe('mapUtil', () => {
  describe('.getKeys()', () => {
    describe('with string keys', () => {
      it('returns an array of all keys', () => {
        const map = new Map<string, number>();
        map.set('one', 1);
        map.set('two', 2);
        map.set('three', 3);

        const keys = getKeys(map);

        expect(keys).to.be.an('array');
        expect(keys).to.have.lengthOf(3);
        expect(keys).to.include('one');
        expect(keys).to.include('two');
        expect(keys).to.include('three');
      });

      it('maintains insertion order', () => {
        const map = new Map<string, number>();
        map.set('first', 1);
        map.set('second', 2);
        map.set('third', 3);

        const keys = getKeys(map);

        expect(keys[0]).to.equal('first');
        expect(keys[1]).to.equal('second');
        expect(keys[2]).to.equal('third');
      });
    });

    describe('with number keys', () => {
      it('returns an array of all keys', () => {
        const map = new Map<number, string>();
        map.set(1, 'one');
        map.set(2, 'two');
        map.set(3, 'three');

        const keys = getKeys(map);

        expect(keys).to.be.an('array');
        expect(keys).to.have.lengthOf(3);
        expect(keys).to.include(1);
        expect(keys).to.include(2);
        expect(keys).to.include(3);
      });
    });

    describe('with object keys', () => {
      it('returns an array of all keys', () => {
        const key1 = { id: 1 };
        const key2 = { id: 2 };
        const map = new Map<object, string>();
        map.set(key1, 'first');
        map.set(key2, 'second');

        const keys = getKeys(map);

        expect(keys).to.be.an('array');
        expect(keys).to.have.lengthOf(2);
        expect(keys[0]).to.equal(key1);
        expect(keys[1]).to.equal(key2);
      });
    });

    describe('with empty map', () => {
      it('returns an empty array', () => {
        const map = new Map<string, number>();

        const keys = getKeys(map);

        expect(keys).to.be.an('array');
        expect(keys).to.have.lengthOf(0);
      });
    });

    describe('after adding and deleting keys', () => {
      it('returns only remaining keys', () => {
        const map = new Map<string, number>();
        map.set('one', 1);
        map.set('two', 2);
        map.set('three', 3);
        map.delete('two');

        const keys = getKeys(map);

        expect(keys).to.have.lengthOf(2);
        expect(keys).to.include('one');
        expect(keys).to.include('three');
        expect(keys).to.not.include('two');
      });
    });
  });
});
