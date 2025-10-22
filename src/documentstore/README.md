# Document Store Interfaces

Abstract interfaces for swappable document database implementations.

## Design Philosophy: 80/20 Rule

This interface is designed to cover **80% of common document database operations** while providing **clear escape hatches for the remaining 20%** of database-specific needs.

### The 80% - Core Operations Covered
- ✅ CRUD operations (get, put, update, delete)
- ✅ Querying with indexes
- ✅ Batch operations
- ✅ Transactions (ACID)
- ✅ Atomic updates (increment, append)
- ✅ Projections (select specific fields)
- ✅ Consistency levels (eventual vs strong)
- ✅ Conditional writes (optimistic locking)
- ✅ Full table scans
- ✅ Query operators (range, IN, comparison)

### The 20% - Escape Hatches
For database-specific features not in the interface:
- Use `executeNative()` for custom operations
- Extend the interface in your implementation
- Examples: aggregations, text search, geospatial queries, change streams

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

### Projections

Select only specific fields to reduce data transfer and improve performance:

```typescript
// Get only name and email (not entire 5MB user document)
const user = await docStore.getDocument<Partial<User>>(
  'users',
  { userId: '123' },
  { projection: ['name', 'email', 'address.city'] }
);

// Query with projection
const users = await docStore.queryDocuments<Partial<User>>('users', {
  filter: { status: 'active' },
  projection: ['name', 'email']
});
```

### Index Selection

Specify which index to query (critical for DynamoDB GSI/LSI):

```typescript
// Query using a specific index
const users = await docStore.queryDocuments<User>('users', {
  indexName: 'email-index',  // DynamoDB GSI
  filter: { email: 'user@example.com' }
});

// Query using createdAt index
const recentUsers = await docStore.queryDocuments<User>('users', {
  indexName: 'createdAt-index',
  filter: { createdAt: { $gte: Date.now() - 86400000 } }
});
```

### Query Operators

Flexible filtering beyond simple equality:

```typescript
// Range query
const adults = await docStore.queryDocuments<User>('users', {
  filter: {
    age: { $gte: 18, $lt: 65 },
    status: { $in: ['active', 'pending'] }
  }
});

// Pattern matching
const johnUsers = await docStore.queryDocuments<User>('users', {
  filter: {
    name: { $beginsWith: 'John' }
  }
});

// Complex query
const filteredUsers = await docStore.queryDocuments<User>('users', {
  filter: {
    age: { $between: [18, 65] },
    'address.city': 'Seattle',
    tags: { $contains: 'premium' }
  }
});
```

### Scan Operations

Full table scan when indexes aren't available (use sparingly):

```typescript
// Scan entire table with filter
const allActiveUsers = await docStore.scanDocuments<User>('users', {
  filter: { status: 'active' },
  limit: 1000
});

// Scan with projection
const userEmails = await docStore.scanDocuments<Partial<User>>('users', {
  projection: ['email']
});
```

### Atomic Operations

Thread-safe updates without read-modify-write race conditions:

```typescript
// Atomic increment (no race condition)
await docStore.atomicUpdate('posts', { postId: '123' }, {
  increment: { viewCount: 1, likes: 1 },
  append: { tags: ['trending'] },
  setIfNotExists: { createdAt: Date.now() }
});

// Atomic array operations
await docStore.atomicUpdate('users', { userId: '123' }, {
  append: { tags: ['premium', 'verified'] },
  remove: { tags: ['trial'] },
  deleteFields: ['temporaryData']
});

// Update view count safely (compare to race-prone alternative)
// ❌ BAD: Race condition
const post = await docStore.getDocument('posts', { postId });
await docStore.putDocument('posts', { ...post, viewCount: post.viewCount + 1 });

// ✅ GOOD: Atomic
await docStore.atomicUpdate('posts', { postId }, {
  increment: { viewCount: 1 }
});
```

### Batch Operations

Execute multiple operations efficiently in a single batch:

```typescript
await docStore.batchWrite('users', {
  puts: [user1, user2, user3],
  deletes: [{ userId: '456' }, { userId: '789' }],
  updates: [
    { key: { userId: '123' }, updates: { status: 'active' } }
  ]
});
```

### Transactions

Multi-document ACID operations:

```typescript
// Transfer credits between accounts (atomic)
await docStore.transact(async (txn) => {
  const account1 = await txn.getDocument<Account>('accounts', { id: 'A' });
  const account2 = await txn.getDocument<Account>('accounts', { id: 'B' });

  if (account1.balance < 100) {
    throw new Error('Insufficient balance');
  }

  await txn.updateDocument('accounts', { id: 'A' }, {
    balance: account1.balance - 100
  });

  await txn.updateDocument('accounts', { id: 'B' }, {
    balance: account2.balance + 100
  });
});
```

### Escape Hatch (The 20%)

For database-specific operations not covered by the interface:

```typescript
// DynamoDB - Custom query with complex expressions
const result = await docStore.executeNative<User[]>({
  command: 'query',
  params: {
    TableName: 'users',
    KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
    FilterExpression: 'attribute_exists(#email)',
    ExpressionAttributeNames: { '#email': 'email' },
    ExpressionAttributeValues: {
      ':pk': 'USER',
      ':start': '2024-01-01',
      ':end': '2024-12-31'
    }
  }
});

// MongoDB - Aggregation pipeline
const stats = await docStore.executeNative<{ _id: string; count: number }[]>({
  command: 'aggregate',
  collection: 'users',
  pipeline: [
    { $match: { status: 'active' } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]
});

// MongoDB - Text search
const searchResults = await docStore.executeNative<User[]>({
  command: 'find',
  collection: 'users',
  filter: { $text: { $search: 'john developer seattle' } }
});

// MongoDB - Geospatial query
const nearbyUsers = await docStore.executeNative<User[]>({
  command: 'find',
  collection: 'users',
  filter: {
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [-122.3321, 47.6062] },
        $maxDistance: 5000
      }
    }
  }
});
```

**When to use `executeNative()`:**
- Aggregations (group by, sum, count)
- Full-text search
- Geospatial queries
- Change streams / triggers
- Database-specific optimizations
- Complex queries not expressible in the interface

**Best practice:**
- Use interface methods for 80% of operations
- Use `executeNative()` only when necessary
- Wrap `executeNative()` calls in your own service methods
- Document what database features you're using

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
