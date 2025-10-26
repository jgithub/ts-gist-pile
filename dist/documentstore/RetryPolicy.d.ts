export interface RetryPolicy {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitter: number;
    retryableOperations: ('get' | 'query' | 'put' | 'delete' | 'update')[];
}
export declare const DEFAULT_RETRY_POLICY: RetryPolicy;
export declare const AGGRESSIVE_RETRY_POLICY: RetryPolicy;
