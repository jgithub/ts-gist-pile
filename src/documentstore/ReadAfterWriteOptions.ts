/**
 * Options for handling read-after-write consistency in eventually consistent databases.
 *
 * In systems like DynamoDB, a write may not be immediately visible on subsequent reads
 * due to eventual consistency. These options control polling behavior to wait for
 * consistency.
 *
 * Example usage:
 * ```typescript
 * const options: ReadAfterWriteOptions = {
 *   timeoutMs: 5000,
 *   pollIntervalMs: 100,
 *   validator: (data) => {
 *     // Ensure the data has the expected shape
 *     return data !== null && typeof data === 'object';
 *   }
 * };
 *
 * // Use with a consistency helper
 * await consistencyHelper.putDocumentAndWaitForConsistency(
 *   'users',
 *   user,
 *   { userId: user.id },
 *   options
 * );
 * ```
 */
export interface ReadAfterWriteOptions {
  /**
   * Maximum time to wait for consistency (milliseconds)
   * @default 5000
   */
  timeoutMs: number;

  /**
   * Delay between polling attempts (milliseconds)
   * @default 100
   */
  pollIntervalMs: number;

  /**
   * Optional validator function to verify data consistency
   * Returns true if the data meets consistency requirements
   *
   * Useful for checking not just presence but correctness:
   * - Field values match expected state
   * - Related records are visible
   * - Secondary indexes are updated
   *
   * @param data - The document retrieved from the database
   * @returns true if data is consistent, false to continue polling
   */
  validator?: (data: unknown) => boolean;
}

/**
 * Default read-after-write options - suitable for most use cases
 */
export const DEFAULT_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions = {
  timeoutMs: 5000,
  pollIntervalMs: 100,
};

/**
 * Fast read-after-write options - for low-latency requirements
 */
export const FAST_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions = {
  timeoutMs: 1000,
  pollIntervalMs: 50,
};

/**
 * Patient read-after-write options - for complex consistency scenarios
 */
export const PATIENT_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions = {
  timeoutMs: 30000,
  pollIntervalMs: 500,
};
