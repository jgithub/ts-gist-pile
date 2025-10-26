export interface ReadAfterWriteOptions {
    timeoutMs: number;
    pollIntervalMs: number;
    validator?: (data: unknown) => boolean;
}
export declare const DEFAULT_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions;
export declare const FAST_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions;
export declare const PATIENT_READ_AFTER_WRITE_OPTIONS: ReadAfterWriteOptions;
