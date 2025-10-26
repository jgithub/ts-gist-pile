export interface RetryOptions<T> {
    maxAttempts: number;
    backoffMs: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    jitter?: number;
    shouldRetry: (error: unknown, result: T | undefined, attempt: number) => boolean;
    onRetry?: (error: unknown, result: T | undefined, attempt: number, delayMs: number) => void;
    onFailure?: (lastError: unknown, lastResult: T | undefined, totalAttempts: number) => void;
}
export declare const DEFAULT_RETRY_OPTIONS: Partial<RetryOptions<unknown>>;
export declare function retryWithBackoff<T>(operation: () => Promise<T>, options: RetryOptions<T>): Promise<T>;
