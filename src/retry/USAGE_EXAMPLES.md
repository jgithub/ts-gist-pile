# Retry Utility - Usage Examples

## Basic Usage

### Retry on Errors

```typescript
import { retryWithBackoff } from 'ts-gist-pile';

// Retry a network request
const data = await retryWithBackoff(
  () => fetch('https://api.example.com/data'),
  {
    maxAttempts: 5,
    backoffMs: 100,
    shouldRetry: (error) => error != null
  }
);
```

### Retry on Null Results (Eventual Consistency)

```typescript
import { retryWithBackoff } from 'ts-gist-pile';

// Retry until document is available (eventual consistency)
const doc = await retryWithBackoff(
  () => documentStore.getDocument('users', { userId: 'test-user' }),
  {
    maxAttempts: 5,
    backoffMs: 100,
    shouldRetry: (error, result) => result == null
  }
);
```

## Advanced Examples

### Custom Result Validation

```typescript
// Retry until job completes
const job = await retryWithBackoff(
  () => jobService.getJobStatus(jobId),
  {
    maxAttempts: 20,
    backoffMs: 1000,
    backoffMultiplier: 1, // Constant backoff for polling
    shouldRetry: (error, result) =>
      result?.status !== 'completed' && result?.status !== 'failed'
  }
);
```

### Conditional Retry Based on Error Type

```typescript
// Only retry on transient errors (5xx), not client errors (4xx)
const response = await retryWithBackoff(
  () => apiClient.post('/endpoint', data),
  {
    maxAttempts: 3,
    backoffMs: 200,
    shouldRetry: (error: any) => {
      // Retry on network errors or 5xx server errors
      return error?.code === 'ECONNRESET' ||
             error?.statusCode >= 500
    }
  }
);
```

### With Callbacks for Logging/Monitoring

```typescript
import { retryWithBackoff } from 'ts-gist-pile';

const result = await retryWithBackoff(
  () => unreliableOperation(),
  {
    maxAttempts: 5,
    backoffMs: 100,
    backoffMultiplier: 2,
    jitter: 0.15,
    shouldRetry: (error) => error != null,
    onRetry: (error, result, attempt, delayMs) => {
      logger.warn(`Operation failed on attempt ${attempt}, retrying in ${delayMs}ms`, {
        error: error?.message
      });
    },
    onFailure: (error, result, totalAttempts) => {
      logger.error(`Operation failed after ${totalAttempts} attempts`, { error });
    }
  }
);
```

### Exponential Backoff with Cap

```typescript
// Exponential backoff but don't wait longer than 5 seconds
const data = await retryWithBackoff(
  () => fetchFromUnreliableService(),
  {
    maxAttempts: 10,
    backoffMs: 100,
    backoffMultiplier: 2,
    maxDelayMs: 5000, // Cap at 5 seconds
    jitter: 0.1,
    shouldRetry: (error) => error != null
  }
);
```

### Polling Pattern

```typescript
// Poll until condition is met (constant backoff)
const readyState = await retryWithBackoff(
  () => checkSystemStatus(),
  {
    maxAttempts: 30,
    backoffMs: 1000, // Poll every second
    backoffMultiplier: 1, // No exponential backoff
    jitter: 0,
    shouldRetry: (error, result) => result?.ready !== true
  }
);
```

## Using DEFAULT_RETRY_OPTIONS

```typescript
import { retryWithBackoff, DEFAULT_RETRY_OPTIONS } from 'ts-gist-pile';

// Use defaults with custom shouldRetry
const result = await retryWithBackoff(
  () => operation(),
  {
    ...DEFAULT_RETRY_OPTIONS,
    maxAttempts: DEFAULT_RETRY_OPTIONS.maxAttempts!, // 3
    backoffMs: DEFAULT_RETRY_OPTIONS.backoffMs!, // 100
    shouldRetry: (error) => error != null
  }
);
```

## Comparison with Other Patterns

### ❌ Manual Retry (Verbose, Error-Prone)

```typescript
async function getDocumentWithRetry(userId: string) {
  let attempts = 0;
  while (attempts < 5) {
    try {
      const doc = await documentStore.getDocument('users', { userId });
      if (doc) return doc;
    } catch (error) {
      // handle error
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempts)));
  }
  return null;
}
```

### ✅ With retryWithBackoff (Clean, Reusable)

```typescript
const doc = await retryWithBackoff(
  () => documentStore.getDocument('users', { userId }),
  {
    maxAttempts: 5,
    backoffMs: 100,
    shouldRetry: (error, result) => result == null
  }
);
```

## Pros & Cons

### Pros
- ✅ **Explicit** - Caller controls retry behavior
- ✅ **Flexible** - Works with any async operation
- ✅ **Reusable** - Generic utility across your codebase
- ✅ **Testable** - Easy to test with mocks
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Observable** - Callbacks for logging/monitoring

### Cons
- ⚠️ **Caller must know** - About eventual consistency or transient failures
- ⚠️ **Not transparent** - Retry logic is visible at call site

## When to Use

Use `retryWithBackoff` when:
- ✅ Handling eventual consistency in distributed databases
- ✅ Making network requests to unreliable services
- ✅ Polling for job completion
- ✅ Recovering from transient failures
- ✅ You need fine-grained control over retry behavior

Don't use it when:
- ❌ Operation should never be retried
- ❌ Errors indicate permanent failures (e.g., validation errors)
- ❌ You need request deduplication or circuit breaking (use different patterns)
