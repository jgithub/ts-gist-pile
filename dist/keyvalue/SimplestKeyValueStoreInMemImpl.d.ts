import { SimplestKeyValueStore } from './SimplestKeyValueStore';
export declare const EvictionMode: {
    readonly LRU: "LRU";
};
export type EvictionMode = typeof EvictionMode[keyof typeof EvictionMode];
export interface SimplestKeyValueStoreInMemOptions {
    maxAggregateMemoryInBytes: number;
    evictionMode: EvictionMode;
}
export declare class SimplestKeyValueStoreInMemImpl implements SimplestKeyValueStore {
    private readonly maxAggregateMemoryInBytes;
    private readonly evictionMode;
    private readonly store;
    private currentMemoryUsage;
    private static readonly ENTRY_OVERHEAD;
    private static readonly BYTES_PER_CHAR;
    constructor(options: SimplestKeyValueStoreInMemOptions);
    put(key: string, value: Uint8Array | null, ttlInSeconds?: number): Promise<void>;
    get(key: string): Promise<{
        value: Uint8Array | null;
        ageInSeconds: number;
    } | undefined>;
    exists(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getCurrentMemoryUsage(): number;
    getEntryCount(): number;
    clear(): void;
    private estimateEntryMemory;
    private evictOldest;
}
