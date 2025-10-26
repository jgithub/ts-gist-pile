export interface DocumentStoreService {
    getDocument<T>(tableName: string, key: Record<string, unknown>, readOptions?: ReadOptions): Promise<T | null>;
    putDocument<T>(tableName: string, document: T, writeOptions?: WriteOptions): Promise<void>;
    queryDocuments<T>(tableName: string, query: DocumentQuery): Promise<T[]>;
    deleteDocument(tableName: string, key: Record<string, unknown>, writeOptions?: WriteOptions): Promise<void>;
    batchGetDocuments<T>(tableName: string, keys: Record<string, unknown>[], readOptions?: ReadOptions): Promise<T[]>;
    updateDocument<T>(tableName: string, key: Record<string, unknown>, updates: Partial<T>, writeOptions?: WriteOptions): Promise<void>;
    scanDocuments<T>(tableName: string, options?: ScanOptions): Promise<T[]>;
    atomicUpdate(tableName: string, key: Record<string, unknown>, operations: AtomicOperations, writeOptions?: WriteOptions): Promise<void>;
    batchWrite(tableName: string, operations: BatchWriteOperations, writeOptions?: WriteOptions): Promise<void>;
    transact<T>(operations: (txn: TransactionContext) => Promise<T>): Promise<T>;
    executeNative<T = unknown>(operation: NativeOperation): Promise<T>;
}
export type ReadConsistency = 'eventual' | 'strong';
export interface ReadOptions {
    consistency?: ReadConsistency;
    projection?: string[];
}
export type WriteAcknowledgment = 'fast' | 'majority' | 'all';
export interface WriteOptions {
    acknowledgment?: WriteAcknowledgment;
    condition?: Record<string, unknown>;
    returnOldValue?: boolean;
}
export interface QueryOperators<T = unknown> {
    $eq?: T;
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: T[];
    $nin?: T[];
    $exists?: boolean;
    $regex?: string;
    $between?: [T, T];
    $beginsWith?: string;
    $contains?: T;
}
export type FilterValue = unknown | QueryOperators;
export interface DocumentQuery extends ReadOptions {
    filter?: Record<string, FilterValue>;
    indexName?: string;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    limit?: number;
    nextToken?: string;
}
export interface DocumentQueryResult<T> {
    items: T[];
    nextToken?: string;
}
export interface ScanOptions extends ReadOptions {
    filter?: Record<string, FilterValue>;
    limit?: number;
    nextToken?: string;
}
export interface AtomicOperations {
    increment?: Record<string, number>;
    append?: Record<string, unknown[]>;
    remove?: Record<string, unknown[]>;
    setIfNotExists?: Record<string, unknown>;
    deleteFields?: string[];
}
export interface BatchWriteOperations {
    puts?: unknown[];
    deletes?: Record<string, unknown>[];
    updates?: Array<{
        key: Record<string, unknown>;
        updates: Record<string, unknown>;
    }>;
}
export interface TransactionContext {
    getDocument<T>(tableName: string, key: Record<string, unknown>): Promise<T | null>;
    putDocument<T>(tableName: string, document: T): Promise<void>;
    updateDocument<T>(tableName: string, key: Record<string, unknown>, updates: Partial<T>): Promise<void>;
    deleteDocument(tableName: string, key: Record<string, unknown>): Promise<void>;
}
export interface NativeOperation {
    command: string;
    [key: string]: unknown;
}
