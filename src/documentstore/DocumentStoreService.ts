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
 * Query specification for document queries
 */
export interface DocumentQuery extends ReadOptions {
  /** Filter conditions (field: value pairs) */
  filter?: Record<string, unknown>;

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
