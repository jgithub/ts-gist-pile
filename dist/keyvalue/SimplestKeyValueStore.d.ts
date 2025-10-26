export interface SimplestKeyValueStore {
    put(key: string, value: Uint8Array | null, ttlInSeconds?: number): Promise<void>;
    get(key: string): Promise<{
        value: Uint8Array | null;
        ageInSeconds: number;
    } | undefined>;
    exists(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
}
export type SimplestCacheService = SimplestKeyValueStore;
export type SimplestBlobStorageService = SimplestKeyValueStore;
