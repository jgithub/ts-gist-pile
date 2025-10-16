/**
 * Simplest key-value store interface for storing string values with optional TTL.
 *
 * This interface supports storing nullable string values with time-to-live (TTL)
 * expiration. It's designed to be implementable by various storage backends
 * (in-memory, Redis, DynamoDB, etc.).
 *
 * @example
 * // Store a value with 60 second TTL
 * await store.put('user:123', 'john@example.com', 60);
 *
 * // Store a null value (useful for caching "not found" results)
 * await store.put('user:999', null, 30);
 *
 * // Retrieve the value
 * const result = await store.get('user:123');
 * if (result) {
 *   console.log(result.value); // 'john@example.com'
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
   * @param value - The value to store (can be null)
   * @param ttlInSeconds - Time-to-live in seconds (undefined = no expiration)
   * @returns Promise that resolves when the value is stored
   *
   * @example
   * // Store without expiration
   * await store.put('config:theme', 'dark');
   *
   * // Store with 300 second (5 minute) expiration
   * await store.put('session:abc123', 'user-data', 300);
   *
   * // Store null to cache a "not found" result
   * await store.put('user:deleted', null, 60);
   */
  put(key: string, value: string | null, ttlInSeconds?: number): Promise<void>;

  /**
   * Get the value if present and not expired.
   *
   * @param key - The storage key
   * @returns Promise resolving to:
   *   - undefined if key is missing or expired
   *   - { value: string | null, ageInSeconds: number } if present and not expired
   *
   * The ageInSeconds field indicates how long ago the value was stored.
   *
   * @example
   * const result = await store.get('user:123');
   * if (result) {
   *   if (result.value === null) {
   *     console.log('Cached null value');
   *   } else {
   *     console.log(`Value: ${result.value}, stored ${result.ageInSeconds}s ago`);
   *   }
   * } else {
   *   console.log('Key not found or expired');
   * }
   */
  get(key: string): Promise<{ value: string | null; ageInSeconds: number } | undefined>;

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
