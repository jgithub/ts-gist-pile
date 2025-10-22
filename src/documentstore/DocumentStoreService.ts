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
 * }
 * ```
 */
export interface DocumentStoreService {
  /**
   * Get a single document by key
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document
   * @returns The document if found, null otherwise
   */
  getDocument<T>(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<T | null>;

  /**
   * Put (insert or update) a document
   *
   * @param tableName - Name of the table/collection
   * @param document - Document to store
   */
  putDocument<T>(
    tableName: string,
    document: T
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
   */
  deleteDocument(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<void>;

  /**
   * Batch get multiple documents
   *
   * @param tableName - Name of the table/collection
   * @param keys - Array of primary keys
   * @returns Array of documents (may be fewer than requested if some don't exist)
   */
  batchGetDocuments<T>(
    tableName: string,
    keys: Record<string, unknown>[]
  ): Promise<T[]>;

  /**
   * Update specific attributes of a document
   *
   * @param tableName - Name of the table/collection
   * @param key - Primary key identifying the document
   * @param updates - Partial document with fields to update
   */
  updateDocument<T>(
    tableName: string,
    key: Record<string, unknown>,
    updates: Partial<T>
  ): Promise<void>;
}

/**
 * Query specification for document queries
 */
export interface DocumentQuery {
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
