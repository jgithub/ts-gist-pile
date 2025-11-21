import { tryGetEnvVar } from "../env/environmentUtil"
import { smartObfuscate } from "./smartObfuscate";

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
 * PII field names to be sanitized when LOG_HASH_SECRET is set or LOG_EAGER_AUTO_SANITIZE is enabled.
 * Includes common patterns for personally identifiable information.
 */
const PII_FIELDS = [
  // User identifiers
  'userId', 'user_id', 'principalId', 'principal_id', 'uid', 'login',
  'username', 'user_name', 'userName',

  // Email variations
  'email', 'e_mail', 'e-mail', 'eMail', 'Email',
  'emailAddress', 'email_address', 'emailSanitized', 'email_sanitized',
  'emailNormalized', 'email_normalized',

  // Names
  'name', 'fullname', 'fullName', 'full_name',
  'firstName', 'first_name', 'lastName', 'last_name',
  'middleName', 'middle_name',

  // Contact information
  'phone', 'phoneNumber', 'phone_number', 'telephone', 'mobile', 'cellPhone',

  // Sensitive identifiers
  'ssn', 'socialSecurity', 'social_security',
  'dob', 'dateOfBirth', 'date_of_birth', 'birthdate', 'birth_date',
  'passport', 'passportNumber', 'passport_number',
  'license', 'driversLicense', 'drivers_license', 'driverLicense', 'driver_license',

  // Financial information
  'creditCard', 'credit_card', 'creditCardNumber', 'credit_card_number',
  'ccNumber', 'cc_number', 'cardNumber', 'card_number',
  'cvv', 'cvc', 'securityCode', 'security_code',
  'accountNumber', 'account_number', 'bankAccount', 'bank_account',
  'routingNumber', 'routing_number',

  // Location information
  'address', 'street', 'streetAddress', 'street_address',
  'city', 'state', 'province',
  'zip', 'zipCode', 'zip_code', 'postal', 'postalCode', 'postal_code',
  'country',
  'ip', 'ipAddress', 'ip_address', 'ipv4', 'ipv6',
  'lat', 'latitude', 'lon', 'longitude', 'coordinates',

  // Authentication & Security
  'password', 'passwd', 'pwd', 'pass',
  'secret', 'apiKey', 'api_key', 'accessToken', 'access_token',
  'refreshToken', 'refresh_token', 'token', 'auth', 'authToken', 'auth_token',
  'privateKey', 'private_key', 'publicKey', 'public_key',

  // Medical information
  'medicalRecordNumber', 'medical_record_number', 'mrn',
  'healthInsurance', 'health_insurance', 'insuranceNumber', 'insurance_number'
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

/**
 * Scans a string value for PII patterns and redacts them.
 * Used by eagerSanitizePII to check values even when field names don't indicate PII.
 */
function scanStringValueForPII(input: string): string {
  let result = input;

  // Credit card numbers (15-16 digits, with or without separators)
  result = result.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{3,4}\b/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 15 && digits.length <= 16) {
      return '****' + match.slice(-4);
    }
    return match;
  });

  // SSN (###-##-####)
  result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (match) => {
    return '****' + match.slice(-4);
  });

  // Phone numbers (various formats)
  result = result.replace(/\b[\+]?[\d\s\-\(\)]{10,}\b/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return '****' + match.slice(-4);
    }
    return match;
  });

  // Email addresses
  result = result.replace(/\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g, (match) => {
    const parts = match.split('@');
    const local = parts[0];
    const domain = parts[1];
    if (local.length <= 2) {
      return `****@${domain}`;
    }
    return `${local.substring(0, 2)}****@${domain}`;
  });

  // IP addresses (IPv4)
  result = result.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, (match) => {
    const parts = match.split('.');
    if (parts.every(p => parseInt(p) <= 255)) {
      return `****${match.slice(-4)}`;
    }
    return match;
  });

  // Names (capitalized words, at least 2 words)
  result = result.replace(/\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/g, (match, first, last) => {
    return `${first.substring(0, 2)}**** ${last.substring(0, 2)}****`;
  });

  return result;
}

/**
 * Eagerly sanitizes an object by detecting and obfuscating known PII fields.
 * This function works INDEPENDENTLY of LOG_HASH_SECRET - it always sanitizes when called.
 *
 * Key differences from sanitizePII():
 * - Always active (does not check isPIISecureModeEnabled)
 * - Keeps original field names (no _redacted suffix)
 * - Replaces PII values with obfuscated versions (e.g., "****me" for "password")
 * - When LOG_HASH_SECRET is set, also includes hash: "****me (hashed=abc123)"
 *
 * Use this when LOG_EAGER_AUTO_SANITIZE is enabled to automatically
 * protect sensitive data before it reaches the logger.
 *
 * @param obj - Object potentially containing PII
 * @returns Sanitized object with PII field values obfuscated
 */
export function eagerSanitizePII(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => eagerSanitizePII(item));
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

    if (isPIIField && typeof value === 'string') {
      // Use smart context-aware obfuscation
      let obfuscated = smartObfuscate(value);

      // If LOG_HASH_SECRET is set, also add hash for correlation
      if (isPIISecureModeEnabled() && value.length > 10) {
        const hash = hashPIIValue(value);
        obfuscated = `${obfuscated} (hashed=${hash})`;
      }

      // Keep original field name, just obfuscate the value
      sanitized[key] = obfuscated;
    } else if (isPIIField && value != null) {
      // For non-string PII values, convert to string first then obfuscate
      const stringValue = String(value);
      let obfuscated = smartObfuscate(stringValue);

      if (isPIISecureModeEnabled() && stringValue.length > 10) {
        const hash = hashPIIValue(stringValue);
        obfuscated = `${obfuscated} (hashed=${hash})`;
      }

      sanitized[key] = obfuscated;
    } else if (typeof value === 'string') {
      // For non-PII field names, still scan the string value for PII patterns
      // This catches cases like keyIsPrettyNormal: "bob@example.com"
      const scanned = scanStringValueForPII(value);
      sanitized[key] = scanned;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = eagerSanitizePII(value);
    } else {
      // Keep non-PII fields as-is
      sanitized[key] = value;
    }
  }

  return sanitized;
}
