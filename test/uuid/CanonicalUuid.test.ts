import { expect } from 'chai';
import { CanonicalUuid } from '../../src/uuid/CanonicalUuid';
import type { CanonicalUuid as CanonicalUuidType } from '../../src/uuid/CanonicalUuid';

describe('CanonicalUuid', () => {
  describe('fromString', () => {
    it('should create a CanonicalUuid from a valid lowercase UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = CanonicalUuid.fromString(uuid);

      expect(result).to.equal(uuid);
      expect(typeof result).to.equal('string');
    });

    it('should convert uppercase UUID to lowercase', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const result = CanonicalUuid.fromString(uuid);

      expect(result).to.equal('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should handle mixed case UUID', () => {
      const uuid = '550e8400-E29B-41d4-A716-446655440000';
      const result = CanonicalUuid.fromString(uuid);

      expect(result).to.equal('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should trim whitespace', () => {
      const uuid = '  550e8400-e29b-41d4-a716-446655440000  ';
      const result = CanonicalUuid.fromString(uuid);

      expect(result).to.equal('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => CanonicalUuid.fromString('not-a-uuid')).to.throw('invalid UUID');
      expect(() => CanonicalUuid.fromString('550e8400e29b41d4a716446655440000')).to.throw('invalid UUID');
    });

    it('should throw error for non-string input', () => {
      expect(() => CanonicalUuid.fromString(123 as any)).to.throw('requires a string');
      expect(() => CanonicalUuid.fromString(null as any)).to.throw('requires a string');
      expect(() => CanonicalUuid.fromString(undefined as any)).to.throw('requires a string');
    });

    it('should handle all UUID versions (1-5)', () => {
      // V1
      const v1 = '550e8400-e29b-11d4-a716-446655440000';
      expect(() => CanonicalUuid.fromString(v1)).to.not.throw();

      // V4
      const v4 = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => CanonicalUuid.fromString(v4)).to.not.throw();

      // V5
      const v5 = '886313e1-3b8a-5372-9b90-0c9aee199e5d';
      expect(() => CanonicalUuid.fromString(v5)).to.not.throw();
    });
  });

  describe('parse', () => {
    it('should be an alias for fromString', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const fromStringResult = CanonicalUuid.fromString(uuid);
      const parseResult = CanonicalUuid.parse(uuid);

      expect(parseResult).to.equal(fromStringResult);
    });
  });

  describe('v4', () => {
    it('should generate a valid v4 UUID', () => {
      const result = CanonicalUuid.v4();

      expect(CanonicalUuid.isValid(result)).to.be.true;
      expect(result).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate different UUIDs on each call', () => {
      const uuid1 = CanonicalUuid.v4();
      const uuid2 = CanonicalUuid.v4();

      expect(uuid1).to.not.equal(uuid2);
    });

    it('should generate lowercase UUIDs', () => {
      const result = CanonicalUuid.v4();

      expect(result).to.equal(result.toLowerCase());
    });

    it('should have version 4', () => {
      const result = CanonicalUuid.v4();
      expect(CanonicalUuid.getVersion(result)).to.equal(4);
      expect(CanonicalUuid.isV4(result)).to.be.true;
    });
  });

  describe('v7', () => {
    it('should generate a valid v7 UUID', () => {
      const result = CanonicalUuid.v7();

      expect(CanonicalUuid.isValid(result)).to.be.true;
      expect(result).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate different UUIDs on each call', () => {
      const uuid1 = CanonicalUuid.v7();
      const uuid2 = CanonicalUuid.v7();

      expect(uuid1).to.not.equal(uuid2);
    });

    it('should generate lowercase UUIDs', () => {
      const result = CanonicalUuid.v7();

      expect(result).to.equal(result.toLowerCase());
    });

    it('should have version 7', () => {
      const result = CanonicalUuid.v7();
      expect(CanonicalUuid.getVersion(result)).to.equal(7);
      expect(CanonicalUuid.isV7(result)).to.be.true;
    });

    it('should generate time-ordered UUIDs', (done) => {
      const first = CanonicalUuid.v7();

      setTimeout(() => {
        const second = CanonicalUuid.v7();

        // Second UUID should be lexicographically greater (later in time)
        expect(CanonicalUuid.compare(first, second)).to.be.lessThan(0);
        expect(first < second).to.be.true;
        done();
      }, 5);
    });
  });

  describe('toString', () => {
    it('should convert CanonicalUuid to string', () => {
      const uuid = CanonicalUuid.v4();
      const result = CanonicalUuid.toString(uuid);

      expect(result).to.equal(uuid);
      expect(typeof result).to.equal('string');
    });
  });

  describe('isValid', () => {
    it('should return true for valid UUIDs', () => {
      expect(CanonicalUuid.isValid('550e8400-e29b-41d4-a716-446655440000')).to.be.true;
      expect(CanonicalUuid.isValid('550E8400-E29B-41D4-A716-446655440000')).to.be.true;
      expect(CanonicalUuid.isValid('00000000-0000-0000-0000-000000000000')).to.be.true;
    });

    it('should return false for invalid UUIDs', () => {
      expect(CanonicalUuid.isValid('not-a-uuid')).to.be.false;
      expect(CanonicalUuid.isValid('550e8400-e29b-41d4-a716')).to.be.false;
      expect(CanonicalUuid.isValid('550e8400e29b41d4a716446655440000')).to.be.false;
    });

    it('should return false for non-string values', () => {
      expect(CanonicalUuid.isValid(123)).to.be.false;
      expect(CanonicalUuid.isValid(null)).to.be.false;
      expect(CanonicalUuid.isValid(undefined)).to.be.false;
      expect(CanonicalUuid.isValid({})).to.be.false;
    });

    it('should handle edge cases', () => {
      expect(CanonicalUuid.isValid('')).to.be.false;
      expect(CanonicalUuid.isValid('   ')).to.be.false;
    });
  });

  describe('compare', () => {
    it('should return negative when first is lexicographically earlier', () => {
      const uuid1: CanonicalUuidType = '00000000-0000-0000-0000-000000000000' as CanonicalUuidType;
      const uuid2: CanonicalUuidType = 'ffffffff-ffff-ffff-ffff-ffffffffffff' as CanonicalUuidType;

      expect(CanonicalUuid.compare(uuid1, uuid2)).to.be.lessThan(0);
    });

    it('should return positive when first is lexicographically later', () => {
      const uuid1: CanonicalUuidType = 'ffffffff-ffff-ffff-ffff-ffffffffffff' as CanonicalUuidType;
      const uuid2: CanonicalUuidType = '00000000-0000-0000-0000-000000000000' as CanonicalUuidType;

      expect(CanonicalUuid.compare(uuid1, uuid2)).to.be.greaterThan(0);
    });

    it('should return zero for equal UUIDs', () => {
      const uuid1: CanonicalUuidType = '550e8400-e29b-41d4-a716-446655440000' as CanonicalUuidType;
      const uuid2: CanonicalUuidType = '550e8400-e29b-41d4-a716-446655440000' as CanonicalUuidType;

      expect(CanonicalUuid.compare(uuid1, uuid2)).to.equal(0);
    });

    it('should be consistent with lexicographic ordering', () => {
      const uuid1 = CanonicalUuid.fromString('550e8400-e29b-41d4-a716-446655440000');
      const uuid2 = CanonicalUuid.fromString('550e8400-e29b-41d4-a716-446655440001');

      expect(CanonicalUuid.compare(uuid1, uuid2)).to.be.lessThan(0);
      expect(uuid1 < uuid2).to.be.true;
    });
  });

  describe('min', () => {
    it('should return the lexicographically earlier UUID', () => {
      const uuid1: CanonicalUuidType = '00000000-0000-0000-0000-000000000000' as CanonicalUuidType;
      const uuid2: CanonicalUuidType = 'ffffffff-ffff-ffff-ffff-ffffffffffff' as CanonicalUuidType;

      expect(CanonicalUuid.min(uuid1, uuid2)).to.equal(uuid1);
      expect(CanonicalUuid.min(uuid2, uuid1)).to.equal(uuid1);
    });

    it('should return first when UUIDs are equal', () => {
      const uuid1 = CanonicalUuid.v4();
      const uuid2 = CanonicalUuid.fromString(uuid1);

      expect(CanonicalUuid.min(uuid1, uuid2)).to.equal(uuid1);
    });
  });

  describe('max', () => {
    it('should return the lexicographically later UUID', () => {
      const uuid1: CanonicalUuidType = '00000000-0000-0000-0000-000000000000' as CanonicalUuidType;
      const uuid2: CanonicalUuidType = 'ffffffff-ffff-ffff-ffff-ffffffffffff' as CanonicalUuidType;

      expect(CanonicalUuid.max(uuid1, uuid2)).to.equal(uuid2);
      expect(CanonicalUuid.max(uuid2, uuid1)).to.equal(uuid2);
    });

    it('should return first when UUIDs are equal', () => {
      const uuid1 = CanonicalUuid.v4();
      const uuid2 = CanonicalUuid.fromString(uuid1);

      expect(CanonicalUuid.max(uuid1, uuid2)).to.equal(uuid1);
    });
  });

  describe('getVersion', () => {
    it('should return 4 for v4 UUIDs', () => {
      const uuid = CanonicalUuid.v4();
      expect(CanonicalUuid.getVersion(uuid)).to.equal(4);
    });

    it('should return 7 for v7 UUIDs', () => {
      const uuid = CanonicalUuid.v7();
      expect(CanonicalUuid.getVersion(uuid)).to.equal(7);
    });

    it('should correctly identify version from string', () => {
      const v1: CanonicalUuidType = '550e8400-e29b-11d4-a716-446655440000' as CanonicalUuidType;
      expect(CanonicalUuid.getVersion(v1)).to.equal(1);

      const v4: CanonicalUuidType = '550e8400-e29b-41d4-a716-446655440000' as CanonicalUuidType;
      expect(CanonicalUuid.getVersion(v4)).to.equal(4);

      const v5: CanonicalUuidType = '886313e1-3b8a-5372-9b90-0c9aee199e5d' as CanonicalUuidType;
      expect(CanonicalUuid.getVersion(v5)).to.equal(5);
    });
  });

  describe('isV7', () => {
    it('should return true for v7 UUIDs', () => {
      const uuid = CanonicalUuid.v7();
      expect(CanonicalUuid.isV7(uuid)).to.be.true;
    });

    it('should return false for non-v7 UUIDs', () => {
      const uuid = CanonicalUuid.v4();
      expect(CanonicalUuid.isV7(uuid)).to.be.false;
    });
  });

  describe('isV4', () => {
    it('should return true for v4 UUIDs', () => {
      const uuid = CanonicalUuid.v4();
      expect(CanonicalUuid.isV4(uuid)).to.be.true;
    });

    it('should return false for non-v4 UUIDs', () => {
      const uuid = CanonicalUuid.v7();
      expect(CanonicalUuid.isV4(uuid)).to.be.false;
    });
  });

  describe('type safety', () => {
    it('should be a branded type (compile-time check)', () => {
      const uuid: CanonicalUuidType = CanonicalUuid.v4();
      const plainString: string = uuid; // Should work - CanonicalUuid is still a string

      // This would fail at compile time (but we can't test that at runtime):
      // const wrongType: CanonicalUuidType = 'not-branded'; // TypeScript error
    });

    it('should work with type guards', () => {
      const value: any = '550e8400-e29b-41d4-a716-446655440000';

      if (CanonicalUuid.isValid(value)) {
        // TypeScript should infer value as CanonicalUuidType here
        const version = CanonicalUuid.getVersion(value);
        expect(version).to.be.a('number');
      }
    });
  });

  describe('immutability', () => {
    it('should not be affected by mutating the source string', () => {
      let source = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = CanonicalUuid.fromString(source);

      // "Mutate" the source (actually creates a new string, but conceptually)
      source = '00000000-0000-0000-0000-000000000000';

      // UUID should be unchanged
      expect(uuid).to.equal('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain value through string -> CanonicalUuid -> string', () => {
      const original = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = CanonicalUuid.fromString(original);
      const result = CanonicalUuid.toString(uuid);

      expect(result).to.equal(original);
    });

    it('should normalize through uppercase -> CanonicalUuid -> string', () => {
      const original = '550E8400-E29B-41D4-A716-446655440000';
      const uuid = CanonicalUuid.fromString(original);
      const result = CanonicalUuid.toString(uuid);

      expect(result).to.equal('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('real-world usage', () => {
    it('should work as database primary keys', () => {
      const userId = CanonicalUuid.v7(); // Time-ordered for better DB performance
      const sessionId = CanonicalUuid.v4(); // Random for sessions

      expect(CanonicalUuid.isValid(userId)).to.be.true;
      expect(CanonicalUuid.isValid(sessionId)).to.be.true;
      expect(userId).to.not.equal(sessionId);
    });

    it('should sort v7 UUIDs chronologically', () => {
      const ids: CanonicalUuidType[] = [];

      // Generate multiple v7 UUIDs with tiny delays
      for (let i = 0; i < 5; i++) {
        ids.push(CanonicalUuid.v7());
      }

      const sorted = [...ids].sort((a, b) => CanonicalUuid.compare(a, b));

      // Should already be in order since they're time-ordered
      expect(sorted).to.deep.equal(ids);
    });
  });
});
