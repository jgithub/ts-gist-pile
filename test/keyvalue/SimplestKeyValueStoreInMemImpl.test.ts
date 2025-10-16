import { expect } from 'chai';
import { SimplestKeyValueStoreInMemImpl, EvictionMode } from '../../src/keyvalue/SimplestKeyValueStoreInMemImpl';

describe('SimplestKeyValueStoreInMemImpl', () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  describe('basic operations', () => {
    it('should store and retrieve a value', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024, // 1 MB
        evictionMode: EvictionMode.LRU
      });

      const value = encoder.encode('hello world');
      await store.put('key1', value);

      const result = await store.get('key1');
      expect(result).to.not.be.undefined;
      expect(decoder.decode(result!.value as Uint8Array)).to.equal('hello world');
      expect(result!.ageInSeconds).to.be.a('number');
      expect(result!.ageInSeconds).to.be.greaterThanOrEqual(0);
    });

    it('should return undefined for non-existent key', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      const result = await store.get('nonexistent');
      expect(result).to.be.undefined;
    });

    it('should store and retrieve null value', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', null);

      const result = await store.get('key1');
      expect(result).to.not.be.undefined;
      expect(result!.value).to.be.null;
    });

    it('should update existing value', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('first'));
      await store.put('key1', encoder.encode('second'));

      const result = await store.get('key1');
      expect(decoder.decode(result!.value as Uint8Array)).to.equal('second');
    });

    it('should check if key exists', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value'));

      expect(await store.exists('key1')).to.be.true;
      expect(await store.exists('nonexistent')).to.be.false;
    });

    it('should delete a key', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value'));
      const deleted = await store.delete('key1');

      expect(deleted).to.be.true;
      expect(await store.get('key1')).to.be.undefined;
    });

    it('should return false when deleting non-existent key', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      const deleted = await store.delete('nonexistent');
      expect(deleted).to.be.false;
    });
  });

  describe('TTL expiration', () => {
    it('should expire entry after TTL', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value'), 1); // 1 second TTL

      // Should exist immediately
      expect(await store.exists('key1')).to.be.true;

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired now
      expect(await store.exists('key1')).to.be.false;
      expect(await store.get('key1')).to.be.undefined;
    });

    it('should not expire entry without TTL', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value')); // No TTL

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await store.exists('key1')).to.be.true;
    });

    it('should track age correctly', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value'));

      await new Promise(resolve => setTimeout(resolve, 1100));

      const result = await store.get('key1');
      expect(result).to.not.be.undefined;
      expect(result!.ageInSeconds).to.be.greaterThanOrEqual(1);
      expect(result!.ageInSeconds).to.be.lessThan(2);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entries when memory limit reached', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 250, // Small memory limit (fits ~2 entries)
        evictionMode: EvictionMode.LRU
      });

      // Each entry is ~109 bytes (key: 4*2=8, value: 1, overhead: 100)
      await store.put('key1', encoder.encode('a')); // First entry
      await store.put('key2', encoder.encode('b')); // Second entry
      await store.put('key3', encoder.encode('c')); // Should evict key1

      // key1 should be evicted
      expect(await store.exists('key1')).to.be.false;
      // key2 and key3 should still exist
      expect(await store.exists('key2')).to.be.true;
      expect(await store.exists('key3')).to.be.true;
    });

    it('should update LRU order on access', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 250, // Fits ~2 entries
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('a'));
      await store.put('key2', encoder.encode('b'));

      // Access key1 to make it recently used
      await store.get('key1');

      // Add key3, should evict key2 (least recently used)
      await store.put('key3', encoder.encode('c'));

      expect(await store.exists('key1')).to.be.true;
      expect(await store.exists('key2')).to.be.false; // Evicted
      expect(await store.exists('key3')).to.be.true;
    });

    it('should update LRU order on exists check', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 250, // Fits ~2 entries
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('a'));
      await store.put('key2', encoder.encode('b'));

      // Check exists for key1 to make it recently used
      await store.exists('key1');

      // Add key3, should evict key2
      await store.put('key3', encoder.encode('c'));

      expect(await store.exists('key1')).to.be.true;
      expect(await store.exists('key2')).to.be.false; // Evicted
      expect(await store.exists('key3')).to.be.true;
    });
  });

  describe('memory management', () => {
    it('should track memory usage', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      const initialMemory = store.getCurrentMemoryUsage();
      expect(initialMemory).to.equal(0);

      await store.put('key1', encoder.encode('value'));

      const afterPut = store.getCurrentMemoryUsage();
      expect(afterPut).to.be.greaterThan(0);

      await store.delete('key1');

      const afterDelete = store.getCurrentMemoryUsage();
      expect(afterDelete).to.equal(0);
    });

    it('should throw error if single entry exceeds max memory', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 100, // Very small limit
        evictionMode: EvictionMode.LRU
      });

      const largeValue = new Uint8Array(1000); // Too large

      try {
        await store.put('key1', largeValue);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('exceeds maxAggregateMemoryInBytes');
      }
    });

    it('should update memory when replacing value', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('short'));
      const memoryAfterFirst = store.getCurrentMemoryUsage();

      await store.put('key1', encoder.encode('much longer value'));
      const memoryAfterSecond = store.getCurrentMemoryUsage();

      expect(memoryAfterSecond).to.be.greaterThan(memoryAfterFirst);
    });

    it('should track entry count', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      expect(store.getEntryCount()).to.equal(0);

      await store.put('key1', encoder.encode('value1'));
      expect(store.getEntryCount()).to.equal(1);

      await store.put('key2', encoder.encode('value2'));
      expect(store.getEntryCount()).to.equal(2);

      await store.delete('key1');
      expect(store.getEntryCount()).to.equal(1);
    });

    it('should clear all entries', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      await store.put('key1', encoder.encode('value1'));
      await store.put('key2', encoder.encode('value2'));

      store.clear();

      expect(store.getEntryCount()).to.equal(0);
      expect(store.getCurrentMemoryUsage()).to.equal(0);
      expect(await store.exists('key1')).to.be.false;
      expect(await store.exists('key2')).to.be.false;
    });
  });

  describe('configuration', () => {
    it('should accept LRU mode', () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      expect(store).to.be.instanceOf(SimplestKeyValueStoreInMemImpl);
    });

    it('should throw error for invalid max memory', () => {
      expect(() => {
        new SimplestKeyValueStoreInMemImpl({
          maxAggregateMemoryInBytes: 0,
          evictionMode: EvictionMode.LRU
        });
      }).to.throw('maxAggregateMemoryInBytes must be greater than 0');

      expect(() => {
        new SimplestKeyValueStoreInMemImpl({
          maxAggregateMemoryInBytes: -1,
          evictionMode: EvictionMode.LRU
        });
      }).to.throw('maxAggregateMemoryInBytes must be greater than 0');
    });
  });

  describe('JSON data usage', () => {
    it('should store and retrieve JSON data', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      const data = { userId: 123, name: 'John', active: true };
      await store.put('user:123', encoder.encode(JSON.stringify(data)));

      const result = await store.get('user:123');
      expect(result).to.not.be.undefined;

      const retrieved = JSON.parse(decoder.decode(result!.value as Uint8Array));
      expect(retrieved).to.deep.equal(data);
    });
  });

  describe('binary data usage', () => {
    it('should store and retrieve binary data', async () => {
      const store = new SimplestKeyValueStoreInMemImpl({
        maxAggregateMemoryInBytes: 1024 * 1024,
        evictionMode: EvictionMode.LRU
      });

      const binaryData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      await store.put('image:123', binaryData);

      const result = await store.get('image:123');
      expect(result).to.not.be.undefined;
      expect(result!.value).to.deep.equal(binaryData);
    });
  });
});
