/**
 * Simplest key-value store interface for storing binary values with optional TTL.
 *
 * This interface supports storing nullable Uint8Array values with time-to-live (TTL)
 * expiration. It's designed to be implementable by various storage backends
 * (in-memory, Redis, DynamoDB, S3, etc.).
 *
 * Values are stored as Uint8Array (byte arrays) which can represent:
 * - Text strings (UTF-8 encoded)
 * - JSON data
 * - Binary data (images, protobuf, msgpack, etc.)
 *
 * @example
 * // Store a text string with 60 second TTL
 * const encoder = new TextEncoder();
 * await store.put('user:123', encoder.encode('john@example.com'), 60);
 *
 * // Store JSON data
 * const data = { userId: 123, name: 'John' };
 * await store.put('user:data:123', encoder.encode(JSON.stringify(data)), 300);
 *
 * // Store a null value (useful for caching "not found" results)
 * await store.put('user:999', null, 30);
 *
 * // Retrieve and decode a text value
 * const result = await store.get('user:123');
 * if (result && result.value) {
 *   const decoder = new TextDecoder();
 *   const email = decoder.decode(result.value);
 *   console.log(email); // 'john@example.com'
 *   console.log(result.ageInSeconds); // e.g., 15
 * }
 *
 * // Check existence without retrieving the value
 * if (await store.exists('user:123')) {
 *   // Key exists and hasn't expired
 * }
 *
 * // Delete a key
 * const deleted = await store.delete('user:123');
 */
export interface SimplestKeyValueStore {
  /**
   * Store a value (including null) with optional TTL in seconds.
   *
   * @param key - The storage key
   * @param value - The value to store as Uint8Array (can be null)
   * @param ttlInSeconds - Time-to-live in seconds (undefined = no expiration)
   * @returns Promise that resolves when the value is stored
   *
   * @example
   * const encoder = new TextEncoder();
   *
   * // Store text without expiration
   * await store.put('config:theme', encoder.encode('dark'));
   *
   * // Store with 300 second (5 minute) expiration
   * await store.put('session:abc123', encoder.encode('user-data'), 300);
   *
   * // Store JSON data
   * const data = { active: true };
   * await store.put('status', encoder.encode(JSON.stringify(data)), 60);
   *
   * // Store null to cache a "not found" result
   * await store.put('user:deleted', null, 60);
   *
   * // Store binary data (e.g., from file or API)
   * const imageBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, ...]);
   * await store.put('avatar:123', imageBytes, 3600);
   */
  put(key: string, value: Uint8Array | null, ttlInSeconds?: number): Promise<void>;

  /**
   * Get the value if present and not expired.
   *
   * @param key - The storage key
   * @returns Promise resolving to:
   *   - undefined if key is missing or expired
   *   - { value: Uint8Array | null, ageInSeconds: number } if present and not expired
   *
   * The ageInSeconds field indicates how long ago the value was stored.
   *
   * @example
   * const decoder = new TextDecoder();
   *
   * // Get and decode text
   * const result = await store.get('user:123');
   * if (result) {
   *   if (result.value === null) {
   *     console.log('Cached null value');
   *   } else {
   *     const text = decoder.decode(result.value);
   *     console.log(`Value: ${text}, stored ${result.ageInSeconds}s ago`);
   *   }
   * } else {
   *   console.log('Key not found or expired');
   * }
   *
   * // Get and parse JSON
   * const jsonResult = await store.get('user:data:123');
   * if (jsonResult?.value) {
   *   const data = JSON.parse(decoder.decode(jsonResult.value));
   *   console.log(data.userId); // 123
   * }
   *
   * // Get binary data (no decoding needed)
   * const imageResult = await store.get('avatar:123');
   * if (imageResult?.value) {
   *   // Use raw bytes directly
   *   const bytes: Uint8Array = imageResult.value;
   * }
   */
  get(key: string): Promise<{ value: Uint8Array | null; ageInSeconds: number } | undefined>;

  /**
   * Check if a key exists and hasn't expired.
   *
   * Returns true even if the stored value is null.
   *
   * @param key - The storage key
   * @returns Promise resolving to true if key exists and hasn't expired
   *
   * @example
   * if (await store.exists('session:abc123')) {
   *   console.log('Session is still valid');
   * }
   */
  exists(key: string): Promise<boolean>;

  /**
   * Delete the key if present.
   *
   * @param key - The storage key
   * @returns Promise resolving to true if something was removed, false otherwise
   *
   * @example
   * const wasDeleted = await store.delete('user:123');
   * if (wasDeleted) {
   *   console.log('Key was deleted');
   * } else {
   *   console.log('Key did not exist');
   * }
   */
  delete(key: string): Promise<boolean>;
}

/**
 * Alias for SimplestKeyValueStore - semantically represents a cache.
 *
 * Use this type when your use case is primarily caching data with TTL expiration.
 *
 * @example
 * const cache: SimplestCacheService = new SimplestKeyValueStoreInMemImpl({
 *   maxAggregateMemoryInBytes: 100 * 1024 * 1024, // 100 MB cache
 *   evictionMode: EvictionMode.LRU
 * });
 */
export type SimplestCacheService = SimplestKeyValueStore;

/**
 * Alias for SimplestKeyValueStore - semantically represents blob storage.
 *
 * Use this type when your use case is storing binary blobs (files, images, etc.).
 *
 * @example
 * const blobStorage: SimplestBlobStorageService = new SimplestKeyValueStoreInMemImpl({
 *   maxAggregateMemoryInBytes: 500 * 1024 * 1024, // 500 MB for blobs
 *   evictionMode: EvictionMode.LRU
 * });
 */
export type SimplestBlobStorageService = SimplestKeyValueStore;
