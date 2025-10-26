export interface CacheService {
    getOrGenerate<T>(key: string, generateFn: () => Promise<T> | T, options?: CacheOptions): Promise<T>;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
