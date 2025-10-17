import { expect } from 'chai';
import { OptionallyCachedValue } from '../../src/container/OptionallyCachedValue';

describe('OptionallyCachedValue', () => {
  describe('constructor and basic functionality', () => {
    it('stores and retrieves cached value', () => {
      const value = { id: 1, name: 'test' };
      const cached = new OptionallyCachedValue(true, value);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.deep.equal(value);
    });

    it('stores and retrieves non-cached value', () => {
      const value = { id: 1, name: 'test' };
      const notCached = new OptionallyCachedValue(false, value);

      expect(notCached.isCached()).to.be.false;
      expect(notCached.getValue()).to.deep.equal(value);
    });
  });

  describe('with different value types', () => {
    it('works with string values', () => {
      const cached = new OptionallyCachedValue(true, 'hello');

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.equal('hello');
    });

    it('works with number values', () => {
      const cached = new OptionallyCachedValue(true, 42);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.equal(42);
    });

    it('works with boolean values', () => {
      const cached = new OptionallyCachedValue(true, true);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.be.true;
    });

    it('works with null values', () => {
      const cached = new OptionallyCachedValue(true, null);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.be.null;
    });

    it('works with undefined values', () => {
      const cached = new OptionallyCachedValue(false, undefined);

      expect(cached.isCached()).to.be.false;
      expect(cached.getValue()).to.be.undefined;
    });

    it('works with array values', () => {
      const value = [1, 2, 3];
      const cached = new OptionallyCachedValue(true, value);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.deep.equal([1, 2, 3]);
    });

    it('works with complex nested objects', () => {
      const value = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            age: 30
          }
        }
      };
      const cached = new OptionallyCachedValue(true, value);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.deep.equal(value);
    });
  });

  describe('immutability', () => {
    it('returns the same reference each time getValue is called', () => {
      const value = { id: 1 };
      const cached = new OptionallyCachedValue(true, value);

      const retrieved1 = cached.getValue();
      const retrieved2 = cached.getValue();

      expect(retrieved1).to.equal(retrieved2);
      expect(retrieved1).to.equal(value);
    });

    it('cached flag remains constant', () => {
      const cached = new OptionallyCachedValue(true, 'test');

      expect(cached.isCached()).to.be.true;
      expect(cached.isCached()).to.be.true; // Call again to verify consistency
    });
  });

  describe('edge cases', () => {
    it('handles cached flag as false with truthy value', () => {
      const cached = new OptionallyCachedValue(false, 'expensive computation');

      expect(cached.isCached()).to.be.false;
      expect(cached.getValue()).to.equal('expensive computation');
    });

    it('handles cached flag as true with falsy value', () => {
      const cached = new OptionallyCachedValue(true, 0);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.equal(0);
    });

    it('handles empty string', () => {
      const cached = new OptionallyCachedValue(true, '');

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.equal('');
    });

    it('handles empty object', () => {
      const cached = new OptionallyCachedValue(true, {});

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.deep.equal({});
    });

    it('handles empty array', () => {
      const cached = new OptionallyCachedValue(true, []);

      expect(cached.isCached()).to.be.true;
      expect(cached.getValue()).to.deep.equal([]);
    });
  });

  describe('use case scenarios', () => {
    it('represents a cached database query result', () => {
      interface User {
        id: number;
        name: string;
      }

      const user: User = { id: 1, name: 'John' };
      const cachedUser = new OptionallyCachedValue(true, user);

      expect(cachedUser.isCached()).to.be.true;
      expect(cachedUser.getValue().name).to.equal('John');
    });

    it('represents a freshly fetched result', () => {
      interface ApiResponse {
        data: string[];
        timestamp: number;
      }

      const response: ApiResponse = {
        data: ['item1', 'item2'],
        timestamp: Date.now()
      };
      const freshResponse = new OptionallyCachedValue(false, response);

      expect(freshResponse.isCached()).to.be.false;
      expect(freshResponse.getValue().data).to.have.lengthOf(2);
    });
  });
});
