export interface FlagContext {
    userId?: string;
    organizationId?: string;
    userEmail?: string;
    region?: string;
    environment?: string;
    appVersion?: string;
    deviceType?: string;
    attributes?: Record<string, string | number | boolean>;
}
export interface FeatureFlagService {
    isEnabled(flag: string, context?: FlagContext): boolean;
    getVariant(flag: string, context?: FlagContext): string;
    getAllFlags(context?: FlagContext): Record<string, boolean>;
    refresh?(): Promise<void>;
    onFlagChange?(callback: (changedFlags: string[]) => void): () => void;
}
