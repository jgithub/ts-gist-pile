/**
 * Retry utility for handling transient failures with exponential backoff
 *
 * @module retry/retryUtil
 */

/**
 * Options for configuring retry behavior
 */
export interface RetryOptions<T> {
  /**
   * Maximum number of attempts (including initial attempt)
   * @default 3
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds before first retry
   * For exponential backoff, this is the base delay
   * @default 100
   */
  backoffMs: number;

  /**
   * Maximum delay in milliseconds (caps exponential backoff)
   * @default undefined (no cap)
   */
  maxDelayMs?: number;

  /**
   * Backoff multiplier for exponential backoff
   * Delay calculation: backoffMs * (backoffMultiplier ^ (attempt - 1))
   * Set to 1 for constant backoff
   * @default 2 (exponential backoff)
   */
  backoffMultiplier?: number;

  /**
   * Jitter factor to prevent thundering herd (0.0 to 1.0)
   * Adds randomness: delay * (1 + random(-jitter, +jitter))
   * @default 0.1
   */
  jitter?: number;

  /**
   * Predicate to determine if retry should occur
   * Called with both error (if thrown) and result (if successful)
   * Return true to retry, false to stop
   *
   * @param error - The error thrown (if any)
   * @param result - The result returned (if no error)
   * @param attempt - Current attempt number (1-indexed)
   * @returns true to retry, false to return/throw
   *
   * @example
   * // Retry on specific errors
   * shouldRetry: (error) => error?.code === 'ECONNRESET'
   *
   * @example
   * // Retry on null results (eventual consistency)
   * shouldRetry: (error, result) => result == null
   *
   * @example
   * // Retry on both errors and null results
   * shouldRetry: (error, result) => error != null || result == null
   */
  shouldRetry: (error: unknown, result: T | undefined, attempt: number) => boolean;

  /**
   * Optional callback invoked before each retry attempt
   *
   * @param error - The error that triggered the retry
   * @param result - The result that triggered the retry (if no error)
   * @param attempt - Attempt number that just failed (1-indexed)
   * @param delayMs - Milliseconds until next retry
   */
  onRetry?: (error: unknown, result: T | undefined, attempt: number, delayMs: number) => void;

  /**
   * Optional callback invoked when all retries are exhausted
   *
   * @param lastError - The last error thrown (if any)
   * @param lastResult - The last result returned (if no error)
   * @param totalAttempts - Total number of attempts made
   */
  onFailure?: (lastError: unknown, lastResult: T | undefined, totalAttempts: number) => void;
}

/**
 * Default retry options - conservative settings suitable for most use cases
 */
export const DEFAULT_RETRY_OPTIONS: Partial<RetryOptions<unknown>> = {
  maxAttempts: 3,
  backoffMs: 100,
  backoffMultiplier: 2,
  jitter: 0.1,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  backoffMs: number,
  backoffMultiplier: number,
  jitter: number,
  maxDelayMs?: number
): number {
  // Exponential backoff: backoffMs * (multiplier ^ (attempt - 1))
  let delay = backoffMs * Math.pow(backoffMultiplier, attempt - 1);

  // Apply cap if specified
  if (maxDelayMs !== undefined) {
    delay = Math.min(delay, maxDelayMs);
  }

  // Apply jitter: delay * (1 + random(-jitter, +jitter))
  if (jitter > 0) {
    const jitterAmount = delay * jitter * (Math.random() * 2 - 1);
    delay = delay + jitterAmount;
  }

  return Math.max(0, Math.floor(delay));
}

/**
 * Retry an async operation with exponential backoff
 *
 * @template T - The return type of the async operation
 * @param operation - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the operation if successful
 * @throws The last error if all retries are exhausted
 *
 * @example
 * // Retry on network errors
 * const data = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxAttempts: 5,
 *     backoffMs: 100,
 *     shouldRetry: (error) => error?.code === 'ECONNRESET'
 *   }
 * );
 *
 * @example
 * // Retry until result is non-null (eventual consistency)
 * const doc = await retryWithBackoff(
 *   () => documentStore.getDocument('users', { userId: 'test-user' }),
 *   {
 *     maxAttempts: 5,
 *     backoffMs: 100,
 *     shouldRetry: (error, result) => result == null
 *   }
 * );
 *
 * @example
 * // Retry with logging
 * const result = await retryWithBackoff(
 *   () => unreliableOperation(),
 *   {
 *     maxAttempts: 3,
 *     backoffMs: 200,
 *     shouldRetry: (error) => error != null,
 *     onRetry: (error, result, attempt, delayMs) => {
 *       console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
 *     },
 *     onFailure: (error, result, attempts) => {
 *       console.error(`All ${attempts} attempts failed`);
 *     }
 *   }
 * );
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions<T>
): Promise<T> {
  const {
    maxAttempts,
    backoffMs,
    maxDelayMs,
    backoffMultiplier = DEFAULT_RETRY_OPTIONS.backoffMultiplier!,
    jitter = DEFAULT_RETRY_OPTIONS.jitter!,
    shouldRetry,
    onRetry,
    onFailure,
  } = options;

  let lastError: unknown;
  let lastResult: T | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      lastResult = result;
      lastError = undefined;

      // Check if we should retry based on the result
      const shouldRetryResult = shouldRetry(undefined, result, attempt);

      if (!shouldRetryResult || attempt === maxAttempts) {
        return result;
      }

      // Need to retry - calculate delay and wait
      const delayMs = calculateDelay(attempt, backoffMs, backoffMultiplier, jitter, maxDelayMs);

      if (onRetry) {
        onRetry(undefined, result, attempt, delayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      lastError = error;
      lastResult = undefined;

      // Check if we should retry based on the error
      const shouldRetryError = shouldRetry(error, undefined, attempt);

      if (!shouldRetryError || attempt === maxAttempts) {
        // Don't retry, or out of attempts
        if (onFailure && attempt === maxAttempts) {
          onFailure(error, undefined, attempt);
        }
        throw error;
      }

      // Need to retry - calculate delay and wait
      const delayMs = calculateDelay(attempt, backoffMs, backoffMultiplier, jitter, maxDelayMs);

      if (onRetry) {
        onRetry(error, undefined, attempt, delayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // This shouldn't be reachable, but TypeScript needs it
  if (onFailure) {
    onFailure(lastError, lastResult, maxAttempts);
  }

  if (lastError !== undefined) {
    throw lastError;
  }

  return lastResult as T;
}
