import { tryGetEnvVar } from "../env/internalEnvUtil";

// Conditionally import crypto only in Node.js
let nodeCrypto: any;
if (typeof window === "undefined" && typeof global !== "undefined") {
  try {
    nodeCrypto = require("crypto");
  } catch (err) {
    // Crypto not available
  }
}

/**
 * PII field names to be sanitized when LOG_HASH_SECRET is set.
 * Includes common patterns for personally identifiable information.
 */
const PII_FIELDS = [
  'userId', 'user_id', 'principalId', 'principal_id', 'email', 'emailSanitized',
  'email_sanitized', 'username', 'user_name', 'uid', 'login', 'name',
  'fullname', 'fullName', 'full_name',
  'phone', 'phoneNumber', 'phone_number', 'ssn', 'dob', 'dateOfBirth',
  'firstName', 'first_name', 'lastName', 'last_name', 'fullName', 'full_name',
  'address', 'street', 'city', 'zip', 'zipCode', 'postal', 'ip', 'ipAddress',
  'ip_address', 'creditCard', 'credit_card', 'ccNumber', 'passport', 'license',
  'driversLicense', 'socialSecurity'
];

/**
 * Checks if PII Secure Mode is enabled.
 * Requires both Node.js environment and LOG_HASH_SECRET to be set.
 */
export function isPIISecureModeEnabled(): boolean {
  if (typeof window !== "undefined") {
    // Browser environment - PII mode not supported
    return false;
  }

  const secret = tryGetEnvVar('LOG_HASH_SECRET');
  return secret != null && secret.trim().length > 0 && nodeCrypto != null;
}

/**
 * Creates a consistent, irreversible hash for logging.
 * HIPAA/GDPR compliant for de-identification.
 *
 * @param value - The value to hash
 * @returns 12-character hex hash (48 bits of entropy)
 */
function hashPII(value: string | null | undefined): string {
  if (value == null) return 'null';

  if (!nodeCrypto) {
    // Fallback if crypto is not available
    return '****';
  }

  const secret = tryGetEnvVar('LOG_HASH_SECRET') || '';

  try {
    return nodeCrypto
      .createHash('sha256')
      .update(value + secret)
      .digest('hex')
      .substring(0, 12); // 12 hex chars = 48 bits of entropy
  } catch (err) {
    // Fallback on error
    return '****';
  }
}

/**
 * Public function to hash a single PII value.
 * Used by d4lPii() and other utilities that need to hash individual values.
 *
 * @param value - The value to hash
 * @returns 12-character hex hash (48 bits of entropy)
 */
export function hashPIIValue(value: string | null | undefined): string {
  return hashPII(value);
}

/**
 * Sanitizes an object by hashing known PII fields.
 * Only active when LOG_HASH_SECRET environment variable is set.
 *
 * @param obj - Object potentially containing PII
 * @returns Sanitized object with PII fields hashed
 */
export function sanitizePII(obj: any): any {
  if (!isPIISecureModeEnabled()) {
    // PII mode not enabled, return as-is
    return obj;
  }

  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePII(item));
  }

  // Handle objects
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    // Strip leading underscore for matching (e.g., _userId should match userId)
    const keyWithoutUnderscore = lowerKey.startsWith('_') ? lowerKey.substring(1) : lowerKey;

    const isPIIField = PII_FIELDS.some(piiField => {
      const lowerPIIField = piiField.toLowerCase();
      return (
        lowerKey === lowerPIIField ||
        keyWithoutUnderscore === lowerPIIField ||
        lowerKey.includes(lowerPIIField) ||
        keyWithoutUnderscore.includes(lowerPIIField)
      );
    });

    if (isPIIField) {
      // Replace PII field with hashed version
      const hashedKey = `${key}_hash`;
      sanitized[hashedKey] = hashPII(value != null ? String(value) : value);
      // Original field is NOT included
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizePII(value);
    } else {
      // Keep non-PII fields as-is
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Gets the list of PII field names that will be sanitized.
 * Useful for documentation and testing.
 */
export function getPIIFieldNames(): string[] {
  return [...PII_FIELDS];
}
