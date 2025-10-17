import { expect } from 'chai';
import { safeStringify } from '../../src/string/safeStringify';

describe('safeStringify', () => {
  describe('with simple objects', () => {
    it('stringifies simple object', () => {
      const obj = { name: 'John', age: 30 };
      const result = safeStringify(obj);

      expect(result).to.equal('{"name":"John","age":30}');
    });

    it('stringifies nested object', () => {
      const obj = {
        user: {
          name: 'John',
          address: {
            city: 'New York'
          }
        }
      };
      const result = safeStringify(obj);

      expect(result).to.equal('{"user":{"name":"John","address":{"city":"New York"}}}');
    });

    it('stringifies arrays', () => {
      const arr = [1, 2, 3, { id: 4 }];
      const result = safeStringify(arr);

      expect(result).to.equal('[1,2,3,{"id":4}]');
    });
  });

  describe('with circular references', () => {
    it('handles simple circular reference', () => {
      const obj: any = { name: 'John' };
      obj.self = obj; // Circular reference

      const result = safeStringify(obj);

      // Circular reference should be replaced with undefined
      expect(result).to.equal('{"name":"John"}');
    });

    it('handles nested circular reference', () => {
      const obj: any = {
        user: {
          name: 'John',
          parent: null as any
        }
      };
      obj.user.parent = obj; // Circular reference to root

      const result = safeStringify(obj);

      expect(result).to.be.a('string');
      expect(result).to.include('"name":"John"');
    });

    it('handles multiple circular references', () => {
      const obj: any = { a: {}, b: {} };
      obj.a.ref = obj;
      obj.b.ref = obj;

      const result = safeStringify(obj);

      expect(result).to.be.a('string');
    });
  });

  describe('with indent parameter', () => {
    it('formats with no indentation by default', () => {
      const obj = { name: 'John', age: 30 };
      const result = safeStringify(obj);

      expect(result).to.equal('{"name":"John","age":30}');
    });

    it('formats with specified indentation', () => {
      const obj = { name: 'John', age: 30 };
      const result = safeStringify(obj, 2);

      expect(result).to.include('\n');
      expect(result).to.include('  "name"');
      expect(result).to.include('  "age"');
    });
  });

  describe('with primitive values', () => {
    it('stringifies string', () => {
      const result = safeStringify('hello');
      expect(result).to.equal('"hello"');
    });

    it('stringifies number', () => {
      const result = safeStringify(42);
      expect(result).to.equal('42');
    });

    it('stringifies boolean', () => {
      const result = safeStringify(true);
      expect(result).to.equal('true');
    });

    it('stringifies null', () => {
      const result = safeStringify(null);
      expect(result).to.equal('null');
    });

    it('stringifies undefined', () => {
      const result = safeStringify(undefined);
      expect(result).to.be.undefined;
    });
  });

  describe('with special values', () => {
    it('handles Date objects', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const result = safeStringify(date);

      expect(result).to.include('2025-01-01');
    });

    it('handles empty object', () => {
      const result = safeStringify({});
      expect(result).to.equal('{}');
    });

    it('handles empty array', () => {
      const result = safeStringify([]);
      expect(result).to.equal('[]');
    });
  });

  describe('with functions', () => {
    it('omits functions from objects', () => {
      const obj = {
        name: 'John',
        greet: () => 'hello'
      };
      const result = safeStringify(obj);

      expect(result).to.equal('{"name":"John"}');
      expect(result).to.not.include('greet');
    });
  });

  describe('with bigint values', () => {
    it('returns undefined for bigint (cannot stringify)', () => {
      const obj = { value: BigInt(9007199254740991) };
      const result = safeStringify(obj);

      // BigInt causes JSON.stringify to throw
      expect(result).to.be.undefined;
    });
  });
});
