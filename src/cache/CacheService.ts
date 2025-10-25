/**
 * Cache service interface supporting get-or-generate pattern with TTL configuration.
 * Enables efficient caching with automatic generation of missing values.
 */
export interface CacheService {
  /**
   * Get a value from cache, or generate and cache it if not present.
   * This implements the cache-aside pattern:
   * 1. Check cache for key
   * 2. If found, return cached value
   * 3. If not found, execute generateFn
   * 4. Store the generated value with given options
   * 5. Return the generated value
   *
   * @param key - The cache key
   * @param generateFn - Function to generate the value if not cached
   * @param options - Cache options including TTL
   * @returns The cached or generated value
   */
  getOrGenerate<T>(
    key: string,
    generateFn: () => Promise<T> | T,
    options?: CacheOptions
  ): Promise<T>;

  /**
   * Get a value from the cache by key
   * @param key - The cache key
   * @returns The cached value, or undefined if not found or expired
   */
  get<T>(key: string): Promise<T | undefined>;

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param options - Cache options including TTL
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - The cache key
   * @returns true if the key exists and is valid, false otherwise
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a specific key from the cache
   * @param key - The cache key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all entries from the cache
   */
  clear(): Promise<void>;
}

/**
 * Configuration options for cache operations
 */
export interface CacheOptions {
  /**
   * Time to live in seconds. After this duration, the cached value is considered expired.
   * If not specified, implementation may use a default TTL or keep indefinitely.
   */
  ttl?: number;

  /**
   * Optional tags for organizing and invalidating related cache entries
   */
  tags?: string[];
}
