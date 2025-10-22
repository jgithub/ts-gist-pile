# Document Store Interfaces

Abstract interfaces for swappable document database implementations.

## Purpose

These interfaces enable **programming to an interface** rather than implementation, allowing you to swap document database implementations (DynamoDB, MongoDB, Firestore, etc.) without changing business logic.

## Core Interfaces

### DocumentStoreService

The main abstraction for document database operations:

```typescript
import { DocumentStoreService } from 'ts-gist-pile';

class UserService {
  constructor(
    @inject(DI_TYPES.DocumentStoreService)
    private readonly docStore: DocumentStoreService
  ) {}

  async saveUser(user: User): Promise<void> {
    await this.docStore.putDocument('users', user);
  }

  async getUser(userId: string): Promise<User | null> {
    return await this.docStore.getDocument<User>('users', { userId });
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return await this.docStore.queryDocuments<User>('users', {
      filter: { role },
      limit: 100
    });
  }

  async getUserWithStrongConsistency(userId: string): Promise<User | null> {
    // Critical read - need guaranteed latest data
    return await this.docStore.getDocument<User>(
      'users',
      { userId },
      { consistency: 'strong' }
    );
  }

  async getUserWithEventualConsistency(userId: string): Promise<User | null> {
    // Fast read - can tolerate slightly stale data
    return await this.docStore.getDocument<User>(
      'users',
      { userId },
      { consistency: 'eventual' }  // or omit for default
    );
  }
}
```

### Write Options

Control write acknowledgment, conditional writes, and optimistic locking:

```typescript
import { WriteAcknowledgment, WriteOptions } from 'ts-gist-pile';

// Fast write - acknowledged by primary only
await docStore.putDocument('users', user, {
  acknowledgment: 'fast'
});

// Majority write - acknowledged by majority of replicas (default)
await docStore.putDocument('users', user, {
  acknowledgment: 'majority'
});

// All replicas write - slowest but most durable
await docStore.putDocument('users', user, {
  acknowledgment: 'all'
});

// Conditional write - optimistic locking pattern
await docStore.updateDocument<User>(
  'users',
  { userId: '123' },
  { status: 'active' },
  {
    condition: { version: 5 },  // Only update if version is 5
    acknowledgment: 'majority'
  }
);

// Delete with condition
await docStore.deleteDocument(
  'users',
  { userId: '123' },
  {
    condition: { status: 'inactive' }  // Only delete if inactive
  }
);
```

**Write acknowledgment levels:**
- **`fast`** - Acknowledged by primary/one replica only (fastest, least durable)
- **`majority`** - Acknowledged by majority of replicas (balanced, default)
- **`all`** - Acknowledged by all replicas (slowest, most durable)

**Conditional writes:**
Use `condition` for optimistic locking to prevent lost updates:
```typescript
// Pattern: Read-modify-write with version check
const user = await docStore.getDocument<User>('users', { userId });
const updatedUser = { ...user, status: 'active', version: user.version + 1 };

await docStore.putDocument('users', updatedUser, {
  condition: { version: user.version }  // Fails if someone else updated
});
```

**Database mappings:**
- **DynamoDB**: All writes are majority (no config), `condition` → ConditionExpression
- **MongoDB**: `fast` = `w:1`, `majority` = `w:'majority'`, `all` = `w:'all'`
- **Cassandra**: `fast` = `ONE`, `majority` = `QUORUM`, `all` = `ALL`

### Read Consistency

Control read consistency per-query for critical vs performance-optimized reads:

```typescript
import { ReadConsistency } from 'ts-gist-pile';

// Strong consistency - read from leader, guaranteed latest
const user = await docStore.getDocument<User>(
  'users',
  { userId },
  { consistency: 'strong' }
);

// Eventual consistency - faster, may return slightly stale data (default)
const users = await docStore.queryDocuments<User>('users', {
  filter: { status: 'active' },
  consistency: 'eventual'
});
```

**When to use strong consistency:**
- Reading data immediately after writing it
- Financial transactions or other critical operations
- When correctness is more important than performance

**When to use eventual consistency:**
- Read-heavy workloads where performance matters
- Data that changes infrequently
- When slight staleness is acceptable (e.g., dashboards, analytics)

**Database mappings:**
- **DynamoDB**: `eventual` = `ConsistentRead: false`, `strong` = `ConsistentRead: true`
- **MongoDB**: `eventual` = `readConcern: 'local'`, `strong` = `readConcern: 'majority'`
- **Cassandra**: `eventual` = `ONE`, `strong` = `QUORUM`

### RetryPolicy

Configuration for handling eventual consistency and transient failures:

```typescript
import { RetryPolicy, DEFAULT_RETRY_POLICY } from 'ts-gist-pile';

// Conservative policy (default)
const readOnlyRetries: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  retryableOperations: ['get', 'query'] // Only retry reads
};

// Aggressive policy for production
const aggressiveRetries: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 50,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: 0.15,
  retryableOperations: ['get', 'query', 'put', 'update']
};

// Wrap your implementation with retry logic
const retryableStore = new RetryableDocumentStoreServiceImpl(
  baseDocumentStore,
  aggressiveRetries
);
```

### ReadAfterWriteOptions

For handling eventual consistency when you need to read immediately after writing:

```typescript
import { ReadAfterWriteOptions, DEFAULT_READ_AFTER_WRITE_OPTIONS } from 'ts-gist-pile';

const options: ReadAfterWriteOptions = {
  timeoutMs: 5000,
  pollIntervalMs: 100,
  validator: (data) => {
    // Custom validation logic
    const user = data as User;
    return user?.status === 'active';
  }
};

// Helper implementation (you provide)
await consistencyHelper.putDocumentAndWaitForConsistency(
  'users',
  user,
  { userId: user.id },
  options
);
```

## Implementation Pattern

### 1. Define Your Implementation

```typescript
// In your project: DynamoDbDocumentStoreServiceImpl.ts
import { DocumentStoreService } from 'ts-gist-pile';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export class DynamoDbDocumentStoreServiceImpl implements DocumentStoreService {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async getDocument<T>(tableName: string, key: Record<string, unknown>): Promise<T | null> {
    // DynamoDB-specific implementation
  }

  async putDocument<T>(tableName: string, document: T): Promise<void> {
    // DynamoDB-specific implementation
  }

  // ... implement other methods
}
```

### 2. Wire It Up in DI Container

```typescript
// diContainer.ts
import { Container, DocumentStoreService } from 'ts-gist-pile';
import { DynamoDbDocumentStoreServiceImpl } from './documentstore/DynamoDbDocumentStoreServiceImpl';
import { MongoDbDocumentStoreServiceImpl } from './documentstore/MongoDbDocumentStoreServiceImpl';

const container = new Container();

// Swap implementations based on environment
const DOCUMENT_STORE_TYPE = process.env.DOCUMENT_STORE_TYPE || 'dynamodb';

let documentStoreService: DocumentStoreService;

if (DOCUMENT_STORE_TYPE === 'mongodb') {
  documentStoreService = new MongoDbDocumentStoreServiceImpl(
    process.env.MONGODB_URI!,
    process.env.MONGODB_DATABASE!
  );
} else {
  documentStoreService = new DynamoDbDocumentStoreServiceImpl();
}

container.bind<DocumentStoreService>(DI_TYPES.DocumentStoreService)
  .toConstantValue(documentStoreService);

export { container };
```

### 3. Use in Business Logic

```typescript
// UserPreferencesServiceImpl.ts
import { inject, DocumentStoreService } from 'ts-gist-pile';

export class UserPreferencesServiceImpl {
  constructor(
    @inject(DI_TYPES.DocumentStoreService)
    private readonly documentStoreService: DocumentStoreService
  ) {}

  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    await this.documentStoreService.putDocument('user_preferences', {
      userId,
      ...preferences
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return await this.documentStoreService.getDocument<UserPreferences>(
      'user_preferences',
      { userId }
    );
  }
}
```

## Design Benefits

1. **Polymorphism** - Swap database implementations without changing business logic
2. **Testability** - Mock the interface for unit tests
3. **Single Responsibility** - Each implementation handles one database type
4. **Interface Debt > Implementation Debt** - Get the interface right first, implementations can evolve
5. **DI-Friendly** - Wire up different implementations in different environments
6. **Composability** - Stack decorators (retry, logging, caching) on any implementation

## What's in ts-gist-pile

This library provides **only the interfaces**, not the implementations. This allows:

- Projects to depend on stable interfaces
- Multiple implementations to be maintained separately
- No vendor lock-in or unnecessary dependencies
- Clear separation of concerns

## What You Implement

Your projects should provide:

- `DynamoDbDocumentStoreServiceImpl` - DynamoDB implementation
- `MongoDbDocumentStoreServiceImpl` - MongoDB implementation
- `RetryableDocumentStoreServiceImpl` - Retry decorator
- `ConsistentReadHelper` - Read-after-write helper
- Any other database-specific implementations

## Related Patterns

This follows the same pattern as other ts-gist-pile interfaces:
- `DateProviderService` - Abstract date/time provider
- `UtcGetterService` - Abstract UTC date getter
- `SimplestKeyValueStore` - Abstract key-value store
