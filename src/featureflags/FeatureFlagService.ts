/**
 * Context information for evaluating feature flags
 */
export interface FlagContext {
  /** User identifier */
  userId?: string;

  /** Organization or account identifier */
  organizationId?: string;

  /** User email for percentage rollouts */
  userEmail?: string;

  /** Geographic region */
  region?: string;

  /** Application environment (dev, staging, prod) */
  environment?: string;

  /** Application version */
  appVersion?: string;

  /** Device type (web, mobile, desktop) */
  deviceType?: string;

  /** Custom attributes for rule evaluation */
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Feature flag service for safe feature deployment and toggles.
 * Enables gradual rollouts, A/B testing, and quick feature disabling.
 */
export interface FeatureFlagService {
  /**
   * Check if a feature flag is enabled
   * @param flag - The flag identifier (e.g., "new-dashboard", "experimental-api")
   * @param context - Optional context for evaluation (user, environment, etc.)
   * @returns Whether the flag is enabled for the given context
   */
  isEnabled(flag: string, context?: FlagContext): boolean;

  /**
   * Get the variant of a multi-variant flag (for A/B/n testing)
   * @param flag - The flag identifier
   * @param context - Optional context for evaluation
   * @returns The variant identifier (e.g., "control", "variant-a", "variant-b")
   */
  getVariant(flag: string, context?: FlagContext): string;

  /**
   * Get all flags and their current values for the given context
   * @param context - Optional context for evaluation
   * @returns Record of flag names to their boolean enabled state
   */
  getAllFlags(context?: FlagContext): Record<string, boolean>;

  /**
   * Refresh flags from the remote source (if applicable)
   * @returns Promise that resolves when flags are refreshed
   */
  refresh?(): Promise<void>;

  /**
   * Register a callback when flag values change
   * @param callback - Function to call when flags change
   * @returns Unsubscribe function
   */
  onFlagChange?(callback: (changedFlags: string[]) => void): () => void;
}