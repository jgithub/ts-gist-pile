import { SimplestKeyValueStore } from './SimplestKeyValueStore';

/**
 * Eviction mode for in-memory key-value store.
 * Currently only LRU (Least Recently Used) is supported.
 */
export const EvictionMode = {
  /** Least Recently Used - evicts the least recently accessed items first */
  LRU: 'LRU'
} as const;

export type EvictionMode = typeof EvictionMode[keyof typeof EvictionMode];

/**
 * Configuration options for SimplestKeyValueStoreInMemImpl.
 */
export interface SimplestKeyValueStoreInMemOptions {
  /**
   * Maximum aggregate memory usage in bytes (approximate).
   * When exceeded, items will be evicted according to the eviction mode.
   *
   * @example
   * maxAggregateMemoryInBytes: 10 * 1024 * 1024 // 10 MB
   */
  maxAggregateMemoryInBytes: number;

  /**
   * Eviction mode to use when memory limit is reached.
   * Currently only LRU (Least Recently Used) is supported.
   */
  evictionMode: EvictionMode;
}

interface StoredEntry {
  value: Uint8Array | null;
  createdAt: number; // timestamp in milliseconds
  ttlInSeconds?: number;
}

/**
 * Simple in-memory implementation of SimplestKeyValueStore with LRU eviction.
 *
 * Features:
 * - LRU (Least Recently Used) eviction when memory limit is reached
 * - Approximate memory tracking to prevent OOM
 * - TTL support with lazy expiration
 * - null value support for negative caching
 *
 * Memory estimation:
 * - Key overhead: ~2 bytes per character (UTF-16)
 * - Value: exact byteLength of Uint8Array
 * - Entry overhead: ~100 bytes (timestamps, metadata, Map overhead)
 *
 * @example
 * const store = new SimplestKeyValueStoreInMemImpl({
 *   maxAggregateMemoryInBytes: 10 * 1024 * 1024, // 10 MB
 *   evictionMode: EvictionMode.LRU
 * });
 *
 * const encoder = new TextEncoder();
 * await store.put('key1', encoder.encode('value1'), 60);
 *
 * const result = await store.get('key1');
 * if (result) {
 *   const decoder = new TextDecoder();
 *   console.log(decoder.decode(result.value)); // 'value1'
 * }
 */
export class SimplestKeyValueStoreInMemImpl implements SimplestKeyValueStore {
  private readonly maxAggregateMemoryInBytes: number;
  private readonly evictionMode: EvictionMode;
  private readonly store: Map<string, StoredEntry>;
  private currentMemoryUsage: number;

  // Memory overhead estimates (in bytes)
  private static readonly ENTRY_OVERHEAD = 100; // metadata, timestamps, Map overhead
  private static readonly BYTES_PER_CHAR = 2; // UTF-16 approximation

  constructor(options: SimplestKeyValueStoreInMemOptions) {
    this.maxAggregateMemoryInBytes = options.maxAggregateMemoryInBytes;
    this.evictionMode = options.evictionMode;
    this.store = new Map();
    this.currentMemoryUsage = 0;

    if (this.maxAggregateMemoryInBytes <= 0) {
      throw new Error('maxAggregateMemoryInBytes must be greater than 0');
    }

    if (this.evictionMode !== EvictionMode.LRU) {
      throw new Error(`Unsupported eviction mode: ${this.evictionMode}`);
    }
  }

  async put(key: string, value: Uint8Array | null, ttlInSeconds?: number): Promise<void> {
    // Remove old entry if exists (to update memory accounting)
    if (this.store.has(key)) {
      await this.delete(key);
    }

    // Calculate memory needed for this entry
    const entryMemory = this.estimateEntryMemory(key, value);

    // Evict items if necessary to make room
    while (this.currentMemoryUsage + entryMemory > this.maxAggregateMemoryInBytes && this.store.size > 0) {
      this.evictOldest();
    }

    // Check if single entry is too large for the store
    if (entryMemory > this.maxAggregateMemoryInBytes) {
      throw new Error(
        `Entry size (${entryMemory} bytes) exceeds maxAggregateMemoryInBytes (${this.maxAggregateMemoryInBytes} bytes)`
      );
    }

    // Store the entry
    const entry: StoredEntry = {
      value,
      createdAt: Date.now(),
      ttlInSeconds
    };

    this.store.set(key, entry);
    this.currentMemoryUsage += entryMemory;
  }

  async get(key: string): Promise<{ value: Uint8Array | null; ageInSeconds: number } | undefined> {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    const ageInSeconds = Math.floor((now - entry.createdAt) / 1000);

    // Check if expired
    if (entry.ttlInSeconds !== undefined && ageInSeconds >= entry.ttlInSeconds) {
      // Lazy deletion of expired entry
      await this.delete(key);
      return undefined;
    }

    // LRU: Move to end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);

    return {
      value: entry.value,
      ageInSeconds
    };
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    const ageInSeconds = Math.floor((now - entry.createdAt) / 1000);

    // Check if expired
    if (entry.ttlInSeconds !== undefined && ageInSeconds >= entry.ttlInSeconds) {
      // Lazy deletion of expired entry
      await this.delete(key);
      return false;
    }

    // LRU: Move to end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);

    return true;
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    this.store.delete(key);
    this.currentMemoryUsage -= this.estimateEntryMemory(key, entry.value);

    return true;
  }

  /**
   * Get current approximate memory usage in bytes.
   */
  getCurrentMemoryUsage(): number {
    return this.currentMemoryUsage;
  }

  /**
   * Get number of entries currently stored.
   */
  getEntryCount(): number {
    return this.store.size;
  }

  /**
   * Clear all entries from the store.
   */
  clear(): void {
    this.store.clear();
    this.currentMemoryUsage = 0;
  }

  /**
   * Estimate memory usage for a single entry (approximate).
   */
  private estimateEntryMemory(key: string, value: Uint8Array | null): number {
    const keyMemory = key.length * SimplestKeyValueStoreInMemImpl.BYTES_PER_CHAR;
    const valueMemory = value?.byteLength ?? 0;
    const overhead = SimplestKeyValueStoreInMemImpl.ENTRY_OVERHEAD;

    return keyMemory + valueMemory + overhead;
  }

  /**
   * Evict the oldest (least recently used) entry.
   */
  private evictOldest(): void {
    // Map maintains insertion order; first key is least recently used
    const firstKey = this.store.keys().next().value;

    if (firstKey !== undefined) {
      this.delete(firstKey); // async but we can use synchronously here since it's internal
    }
  }
}
