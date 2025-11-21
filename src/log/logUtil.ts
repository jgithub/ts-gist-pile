import { safeStringify } from "../string/safeStringify"
import { isPIISecureModeEnabled, hashPIIValue, eagerSanitizePII, sanitizePII } from "./piiSanitizer"
import { isEagerAutoSanitizeEnabled } from "../env/environmentUtil"
import { smartObfuscate } from "./smartObfuscate"

export function d4l(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  if (typeof input === 'undefined') {
    return "<undefined> (undefined)"
  }
  else if (input == null) {
    return "<null> (null)"
  }
  else if (typeof input === 'string') {
    if (logOptions.obfuscate) {
      return smartObfuscate(input);
    }

    if (logOptions.joinLines) {
      input = input?.replace(/\r\n/g, " ")
      input = input?.replace(/\n\r/g, " ")
      input = input?.replace(/\n/g, " ")
      input = input?.replace(/\r/g, " ")      
    }
    return `'${input}' (string, ${input.length})`
  }
  else if (typeof input === 'number') {
    return `${input} (number)`
  }
  else if (typeof input === 'boolean') {
    return `${input == true ? 'TRUE' : 'FALSE'} (boolean)`
  }
  else if (input instanceof Error) {
    let stackStr: string | undefined = (input as Error).stack
    stackStr = stackStr?.replace(/\r\n/g, "\\n,   ")
    stackStr = stackStr?.replace(/\n\r/g, "\\n,   ")
    stackStr = stackStr?.replace(/\n/g, "\\n,   ")
    stackStr = stackStr?.replace(/\r/g, "\\n,   ")
    return `${input} (Error, stack: ${stackStr}`
  }
  else if (Array.isArray(input)) {
    const parts: string[] = []

    const inputAsArray = (input as Array<any>)
    if (inputAsArray.length > 0) {
      parts.push(`${d4l(inputAsArray[0])}`)
    }
    if (inputAsArray.length > 2) {
      parts.push(`…`)
    }
    if (inputAsArray.length > 1) {
      parts.push(`${d4l(inputAsArray[inputAsArray.length-1])}`)
    }

    return `Array(len=${inputAsArray.length}) [${parts.join(", ")}]`
  }
  else if (Object.prototype.toString.call(input) === '[object Date]') {
    return (input as Date).toISOString();
  }  
  else if (input instanceof RegExp) {
    return input.toString() + " (RegExp)";
  }
  else if (typeof input === 'object') {
    // Apply eager sanitization if enabled
    let objectToLog = input;
    if (isEagerAutoSanitizeEnabled()) {
      objectToLog = eagerSanitizePII(input);
    }

    if (typeof ((objectToLog as any).toDebugString) === 'function' ) {
      return (objectToLog as any).toDebugString() + " (object; via toDebugString())"
    }
    if (typeof ((objectToLog as any).toLogString) === 'function' ) {
      return (objectToLog as any).toLogString() + " (object; via toLogString())"
    }
    // Do yourself a huge favor and don't mess with toJSON
    // if (typeof ((objectToLog as any).toJSON) === 'function' ) {
    //   const whateverToJSONReturns = (objectToLog as any).toJSON()
    //   if (typeof whateverToJSONReturns === 'string') {
    //     return whateverToJSONReturns
    //   }
    // }

    if (typeof ((objectToLog as any).asJson) === 'function' ) {
      const whateverAsJsonReturns = (objectToLog as any).asJson()
      // return whateverAsJsonReturns
      try {
        return localSafeStringify(whateverAsJsonReturns) || `${objectToLog}`
      } catch (err){}
    }
    try {
      return localSafeStringify(objectToLog) + " (object)"
    } catch (err){}
  }
  return `${input}`
}

export function d4lObfuscate(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}) {
  // For special object types (Error, Date, RegExp), pass through to d4l
  if (input instanceof Error || input instanceof Date || input instanceof RegExp) {
    return d4l(input, logOptions);
  }

  // For plain objects and arrays, apply eager sanitization
  if (typeof input === 'object' && input !== null) {
    const sanitized = eagerSanitizePII(input);
    return d4l(sanitized, logOptions);
  }

  // For strings, apply smart obfuscation
  if (typeof input === 'string') {
    const obfuscated = smartObfuscate(input);

    // If PII secure mode is enabled, also append the hash for correlation
    if (isPIISecureModeEnabled() && input.length > 10) {
      const hash = hashPIIValue(input);
      return `${obfuscated} (hashed=${hash})`;
    }

    return obfuscated;
  }

  return d4l(input, logOptions);
}

/**
 * Debug-for-logging for PII (Personally Identifiable Information) values.
 *
 * When LOG_HASH_SECRET is UNSET:
 *   - Behaves exactly like d4l() - logs the value normally
 *
 * When LOG_HASH_SECRET is SET:
 *   - Behaves like d4lObfuscate() - shows smart obfuscation with hash
 *   - Uses context-aware obfuscation (emails show domain, cards show last 4, etc.)
 *   - Hash is consistent (same input = same hash)
 *   - Hash is irreversible (cannot recover original value)
 *
 * Use this for values that might contain PII (emails, user IDs, etc.)
 *
 * @example
 * logger.info(`User logged in: ${d4lPii(userId)}`)
 * // Without LOG_HASH_SECRET: "User logged in: 'user-12345' (string, 10)"
 * // With LOG_HASH_SECRET: "User logged in: ****2345 (hashed=abc123def456)"
 */
export function d4lPii(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  if (!isPIISecureModeEnabled()) {
    // PII mode not enabled - use regular d4l (pass through)
    return d4l(input, logOptions);
  }

  // PII mode enabled - only obfuscate strings, pass through everything else
  // d4lPii is designed for use in template strings with individual values,
  // not for entire objects (use logger context for objects)
  if (typeof input === 'string') {
    return d4lObfuscate(input, logOptions);
  }

  // Pass through non-strings unchanged
  return d4l(input, logOptions);
}

/**
 * Helper function to recursively scan object values for PII and redact them.
 * Used by blurWhereNeeded() to handle objects.
 */
function scanObjectForPII(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        return scanStringForPII(item);
      } else if (typeof item === 'object') {
        return scanObjectForPII(item);
      }
      return item;
    });
  }

  // Handle objects
  const scanned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      scanned[key] = scanStringForPII(value);
    } else if (typeof value === 'object' && value !== null) {
      scanned[key] = scanObjectForPII(value);
    } else {
      scanned[key] = value;
    }
  }

  return scanned;
}

/**
 * Helper function to scan a string for PII patterns and redact them.
 * Used by blurWhereNeeded() and scanObjectForPII().
 */
function scanStringForPII(input: string): string {
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
 * Smart content-aware PII detection and redaction.
 *
 * Scans text for PII patterns (emails, SSNs, phone numbers, credit cards, IPs, etc.)
 * and redacts ONLY those parts while keeping the rest of the text readable.
 *
 * ⚠️ PERFORMANCE WARNING: This is the slowest logging option as it performs
 * multiple regex scans on the content. Use sparingly for user input, error messages,
 * or other free-form text that might contain PII.
 *
 * Always active when called - does not depend on environment variables.
 *
 * @example
 * blurWhereNeeded("My email is john@example.com")
 * // → "My email is jo****@example.com"
 *
 * blurWhereNeeded("Call me at 555-123-4567 or email alice@example.com")
 * // → "Call me at ****4567 or email al****@example.com"
 *
 * blurWhereNeeded("SSN: 123-45-6789, Card: 4532-1234-5678-9012")
 * // → "SSN: ****6789, Card: ****9012"
 */
export function blurWhereNeeded(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  // For objects, recursively apply content scanning to all string values
  if (typeof input === 'object' && input !== null) {
    const scanned = scanObjectForPII(input);
    return d4l(scanned, logOptions);
  }

  // For non-string primitives, use regular d4l
  if (typeof input !== 'string') {
    return d4l(input, logOptions);
  }

  // For strings, use the helper function
  return scanStringForPII(input);
}

// Aliases for cleaner API
export const plain = d4l;
export const blur = d4lObfuscate;
export const blurIfEnabled = d4lPii;

/**
 * Short aliases for frequent use (all 3 characters for consistency):
 *
 * d4l - Direct/decorate for logging (plain output with type info)
 * p4l - Plain for logging (same as d4l)
 * b4l - Blur for logging (always obfuscates)
 * c4l - Conditional for logging (blur only if LOG_HASH_SECRET set)
 * s4l - Scan for logging (content-aware PII detection, always active)
 */
export const p4l = d4l;                // plain for logging (alias for d4l)
export const b4l = d4lObfuscate;       // blur for logging (always)
export const c4l = d4lPii;             // conditional for logging (blur if enabled)
export const s4l = blurWhereNeeded;    // scan for logging (content-aware PII)

export type LogOptions = {
  joinLines?: boolean
  obfuscate?: boolean
}

const localSafeStringify = (obj: any, indent = 0) => {
  let cache: any = []
  try {
    const retval = JSON.stringify(
      obj,
      (key, value) => {
        // https://stackoverflow.com/questions/12075927/serialization-of-regexp

        if (value instanceof RegExp) {
          return value.toString();
        }
        return typeof value === 'object' && value !== null
          ? cache.includes(value)
            ? undefined // Duplicate reference found, discard key
            : cache.push(value) && value // Store value in our collection
          : value
      },
      indent
    )
    cache = null
    return retval
  } catch (err) {
    cache = null
    return undefined;
  }  
}