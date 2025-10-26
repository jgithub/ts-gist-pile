"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGGRESSIVE_RETRY_POLICY = exports.DEFAULT_RETRY_POLICY = void 0;
exports.DEFAULT_RETRY_POLICY = {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
    jitter: 0.1,
    retryableOperations: ['get', 'query'],
};
exports.AGGRESSIVE_RETRY_POLICY = {
    maxAttempts: 5,
    initialDelayMs: 50,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitter: 0.15,
    retryableOperations: ['get', 'query', 'put', 'update'],
};
//# sourceMappingURL=RetryPolicy.js.map