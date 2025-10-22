/**
 * DocumentStoreService - Abstract interface for document databases
 *
 * Allows swapping between DynamoDB, MongoDB, Firestore, etc.
 * without changing business logic.
 *
 * This interface provides a common abstraction for CRUD operations
 * on document-oriented databases, enabling polymorphic implementations.
 *
 * Example usage:
 * ```typescript
 * // In your DI container
 * container.bind<DocumentStoreService>(DI_TYPES.DocumentStoreService)
 *   .to(DynamoDbDocumentStoreServiceImpl);
 *
 * // In your business logic
 * class UserService {
 *   constructor(
 *     @inject(DI_TYPES.DocumentStoreService)
 *     private readonly docStore: DocumentStoreService
 *   ) {}
 *
 *   async saveUser(user: User): Promise<void> {
 *     await this.docStore.putDocument('users', user);
 *   }
 *
 *   async saveUserWithAcknowledgment(user: User): Promise<void> {
 *     // Wait for majority of replicas to acknowledge
 *     await this.docStore.putDocument('users', user, {
 *       acknowledgment: 'majority'
 *     });
 *   }
 *
 *   async updateUserWithOptimisticLock(userId: string, updates: Partial<User>, expectedVersion: number): Promise<void> {
 *     // Conditional write - only update if version matches
 *     await this.docStore.updateDocument<User>(
 *       'users',
 *       { userId },
 *       updates,
 *       { condition: { version: expectedVersion } }
 *     );
 *   }
 *
 *   async getUserStrong(userId: string): Promise<User | null> {
 *     // Strong consistency - guaranteed latest data
 *     return await this.docStore.getDocument<User>(
 *       'users',
 *       { userId },
 *       { consistency: 'strong' }
 *     );
 *   }
 *
 *   async queryUsersEventual(role: string): Promise<User[]> {
 *     // Eventual consistency - faster, may be slightly stale
 *     return await this.docStore.queryDocuments<User>('users', {
 *       filter: { role },
 *       consistency: 'eventual'  // or omit for default
 *     });
 *   }
 * }
 * ```
 */
export interface DocumentStoreService {
  /**
   * Get a single document by key
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document
   * @param options - Read options (consistency level, etc.)
   * @returns The document if found, null otherwise
   */
  getDocument<T>(
    tableName: string,
    key: Record<string, unknown>,
    readOptions?: ReadOptions
  ): Promise<T | null>;

  /**
   * Put (insert or update) a document
   *
   * @param tableName - Name of the table/collection
   * @param document - Document to store
   * @param writeOptions - Write options (acknowledgment level, conditions, etc.)
   */
  putDocument<T>(
    tableName: string,
    document: T,
    writeOptions?: WriteOptions
  ): Promise<void>;

  /**
   * Query documents with filter conditions
   *
   * @param tableName - Name of the table/collection
   * @param query - Query specification with filters, sorting, pagination
   * @returns Array of matching documents
   */
  queryDocuments<T>(
    tableName: string,
    query: DocumentQuery
  ): Promise<T[]>;

  /**
   * Delete a document by key
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document to delete
   * @param writeOptions - Write options (acknowledgment level, conditions, etc.)
   */
  deleteDocument(
    tableName: string,
    key: Record<string, unknown>,
    writeOptions?: WriteOptions
  ): Promise<void>;

  /**
   * Batch get multiple documents
   *
   * @param tableName - Name of the table/collection
   * @param keys - Array of primary keys
   * @param options - Read options (consistency level, etc.)
   * @returns Array of documents (may be fewer than requested if some don't exist)
   */
  batchGetDocuments<T>(
    tableName: string,
    keys: Record<string, unknown>[],
    readOptions?: ReadOptions
  ): Promise<T[]>;

  /**
   * Update specific attributes of a document
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document
   * @param updates - Partial document with fields to update
   * @param writeOptions - Write options (acknowledgment level, conditions, etc.)
   */
  updateDocument<T>(
    tableName: string,
    key: Record<string, unknown>,
    updates: Partial<T>,
    writeOptions?: WriteOptions
  ): Promise<void>;

  /**
   * Scan entire table/collection (full table scan)
   *
   * WARNING: Expensive operation - reads all documents
   * Use queryDocuments() with indexes when possible
   *
   * @param tableName - Name of the table/collection
   * @param options - Scan options (filter, projection, etc.)
   * @returns Array of matching documents
   */
  scanDocuments<T>(
    tableName: string,
    options?: ScanOptions
  ): Promise<T[]>;

  /**
   * Atomic update operations (increment, append, etc.)
   *
   * Performs thread-safe updates without read-modify-write
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document
   * @param operations - Atomic operations to perform
   * @param writeOptions - Write options (acknowledgment level, conditions, etc.)
   */
  atomicUpdate(
    tableName: string,
    key: Record<string, unknown>,
    operations: AtomicOperations,
    writeOptions?: WriteOptions
  ): Promise<void>;

  /**
   * Batch write operations (puts, updates, deletes)
   *
   * Executes multiple write operations in a single batch
   * More efficient than individual operations
   *
   * @param tableName - Name of the table/collection
   * @param operations - Batch operations to perform
   * @param writeOptions - Write options (acknowledgment level, etc.)
   */
  batchWrite(
    tableName: string,
    operations: BatchWriteOperations,
    writeOptions?: WriteOptions
  ): Promise<void>;

  /**
   * Execute operations in a transaction (ACID)
   *
   * All operations succeed or all fail atomically
   *
   * @param operations - Transaction callback with transactional operations
   * @returns Result of the transaction
   */
  transact<T>(
    operations: (txn: TransactionContext) => Promise<T>
  ): Promise<T>;

  /**
   * Execute database-specific native operation (escape hatch)
   *
   * Use this for operations not covered by the interface (20% edge cases)
   * Implementation will vary by database
   *
   * @param operation - Database-specific operation descriptor
   * @returns Result of the native operation
   *
   * @example
   * // DynamoDB - execute custom query
   * await docStore.executeNative({
   *   command: 'query',
   *   params: { TableName: 'users', KeyConditionExpression: '...' }
   * });
   *
   * @example
   * // MongoDB - run aggregation pipeline
   * await docStore.executeNative({
   *   command: 'aggregate',
   *   collection: 'users',
   *   pipeline: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
   * });
   */
  executeNative<T = unknown>(operation: NativeOperation): Promise<T>;
}

/**
 * Read consistency level for document queries
 *
 * Maps to database-specific consistency options:
 * - DynamoDB: eventual = ConsistentRead:false, strong = ConsistentRead:true
 * - MongoDB: eventual = readConcern:'local', strong = readConcern:'majority'
 * - Cassandra: eventual = ONE, strong = QUORUM
 */
export type ReadConsistency =
  | 'eventual'  // Fast reads, may return stale data (default)
  | 'strong';   // Consistent reads, guaranteed latest data

/**
 * Options for read operations
 */
export interface ReadOptions {
  /**
   * Read consistency level
   * @default 'eventual'
   */
  consistency?: ReadConsistency;

  /**
   * Fields to return (projection)
   * If specified, only these fields will be returned
   * Reduces data transfer and improves performance
   *
   * @example ['name', 'email', 'address.city']
   */
  projection?: string[];
}

/**
 * Write acknowledgment level for document operations
 *
 * Maps to database-specific write concern/consistency:
 * - DynamoDB: All writes are 'majority' (no configuration needed)
 * - MongoDB: fast = w:1, majority = w:'majority', all = w:'all'
 * - Cassandra: fast = ONE, majority = QUORUM, all = ALL
 */
export type WriteAcknowledgment =
  | 'fast'      // Acknowledged by primary/one replica only
  | 'majority'  // Acknowledged by majority of replicas (default)
  | 'all';      // Acknowledged by all replicas (slowest, most durable)

/**
 * Options for write operations
 */
export interface WriteOptions {
  /**
   * Write acknowledgment level
   * @default 'majority'
   */
  acknowledgment?: WriteAcknowledgment;

  /**
   * Condition expression for conditional writes
   * Only perform write if condition is met (optimistic locking)
   *
   * Example: { version: 5 } - only write if current version is 5
   */
  condition?: Record<string, unknown>;

  /**
   * Return the old document value before the write
   * Useful for optimistic locking patterns
   * @default false
   */
  returnOldValue?: boolean;
}

/**
 * Query operators for flexible filtering
 */
export interface QueryOperators<T = unknown> {
  /** Equal to */
  $eq?: T;
  /** Not equal to */
  $ne?: T;
  /** Greater than */
  $gt?: T;
  /** Greater than or equal */
  $gte?: T;
  /** Less than */
  $lt?: T;
  /** Less than or equal */
  $lte?: T;
  /** In array */
  $in?: T[];
  /** Not in array */
  $nin?: T[];
  /** Exists */
  $exists?: boolean;
  /** Pattern match (regex) */
  $regex?: string;
  /** Between (inclusive) */
  $between?: [T, T];
  /** Begins with (strings) */
  $beginsWith?: string;
  /** Contains (strings/arrays) */
  $contains?: T;
}

/**
 * Filter value - can be a direct value or query operators
 */
export type FilterValue = unknown | QueryOperators;

/**
 * Query specification for document queries
 */
export interface DocumentQuery extends ReadOptions {
  /**
   * Filter conditions
   * Can use equality: { status: 'active' }
   * Or operators: { age: { $gte: 18, $lt: 65 } }
   */
  filter?: Record<string, FilterValue>;

  /**
   * Index name to use for the query
   * Required for DynamoDB GSI/LSI queries
   * Optional hint for MongoDB query planner
   *
   * @example 'email-index', 'createdAt-index'
   */
  indexName?: string;

  /** Sort field and direction */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  /** Maximum number of results */
  limit?: number;

  /** Pagination token for next page */
  nextToken?: string;
}

/**
 * Query result with pagination support
 */
export interface DocumentQueryResult<T> {
  /** Array of matching documents */
  items: T[];

  /** Token for fetching the next page (undefined if no more results) */
  nextToken?: string;
}

/**
 * Scan options for full table scans
 */
export interface ScanOptions extends ReadOptions {
  /** Filter to apply after scanning (not indexed) */
  filter?: Record<string, FilterValue>;

  /** Maximum number of results */
  limit?: number;

  /** Pagination token for next page */
  nextToken?: string;
}

/**
 * Atomic operations for thread-safe updates
 */
export interface AtomicOperations {
  /**
   * Increment numeric fields
   * @example { viewCount: 1, likes: -1 }
   */
  increment?: Record<string, number>;

  /**
   * Append to array fields
   * @example { tags: ['new-tag'], comments: [comment] }
   */
  append?: Record<string, unknown[]>;

  /**
   * Remove from array fields
   * @example { tags: ['old-tag'] }
   */
  remove?: Record<string, unknown[]>;

  /**
   * Set field if it doesn't exist
   * @example { createdAt: Date.now() }
   */
  setIfNotExists?: Record<string, unknown>;

  /**
   * Delete fields from document
   * @example ['temporaryField', 'oldData']
   */
  deleteFields?: string[];
}

/**
 * Batch write operations
 */
export interface BatchWriteOperations {
  /** Documents to put (insert or update) */
  puts?: unknown[];

  /** Keys of documents to delete */
  deletes?: Record<string, unknown>[];

  /** Update operations */
  updates?: Array<{
    key: Record<string, unknown>;
    updates: Record<string, unknown>;
  }>;
}

/**
 * Transaction context for executing transactional operations
 */
export interface TransactionContext {
  /** Get a document within the transaction */
  getDocument<T>(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<T | null>;

  /** Put a document within the transaction */
  putDocument<T>(
    tableName: string,
    document: T
  ): Promise<void>;

  /** Update a document within the transaction */
  updateDocument<T>(
    tableName: string,
    key: Record<string, unknown>,
    updates: Partial<T>
  ): Promise<void>;

  /** Delete a document within the transaction */
  deleteDocument(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<void>;
}

/**
 * Native operation descriptor (escape hatch)
 *
 * Structure varies by database implementation
 * This is intentionally loosely typed to allow database-specific operations
 */
export interface NativeOperation {
  /** Command name (database-specific) */
  command: string;

  /** Additional parameters (database-specific) */
  [key: string]: unknown;
}
