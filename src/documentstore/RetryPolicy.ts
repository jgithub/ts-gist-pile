/**
 * Retry policy configuration for handling eventual consistency
 * and transient failures in document databases.
 *
 * Example usage:
 * ```typescript
 * const policy: RetryPolicy = {
 *   maxAttempts: 5,
 *   initialDelayMs: 100,
 *   maxDelayMs: 10000,
 *   backoffMultiplier: 2,
 *   jitter: 0.1,
 *   retryableOperations: ['get', 'query'] // Only retry reads
 * };
 *
 * // Wrap your document store with retry logic
 * const retryableStore = new RetryableDocumentStoreServiceImpl(
 *   baseDocumentStore,
 *   policy
 * );
 * ```
 */
export interface RetryPolicy {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 100
   */
  initialDelayMs: number;

  /**
   * Maximum delay in milliseconds (caps exponential backoff)
   * @default 5000
   */
  maxDelayMs: number;

  /**
   * Backoff multiplier for exponential backoff
   * Delay calculation: initialDelayMs * (backoffMultiplier ^ (attempt - 1))
   * @default 2
   */
  backoffMultiplier: number;

  /**
   * Jitter factor to prevent thundering herd (0.0 to 1.0)
   * Adds randomness: delay * (1 + random(-jitter, +jitter))
   * @default 0.1
   */
  jitter: number;

  /**
   * Which operations should be retried
   * Generally safer to only retry idempotent reads
   * @default ['get', 'query']
   */
  retryableOperations: ('get' | 'query' | 'put' | 'delete' | 'update')[];
}

/**
 * Default retry policy - conservative settings suitable for most use cases
 */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitter: 0.1,
  retryableOperations: ['get', 'query'], // Only retry reads by default
};

/**
 * Aggressive retry policy for production environments with high availability requirements
 */
export const AGGRESSIVE_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 50,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: 0.15,
  retryableOperations: ['get', 'query', 'put', 'update'], // Retry writes too
};
