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

/**
 * Debug-for-logging for a credential or any other value that must not be printed (a token, a secret, a password, a
 * login code). ALWAYS obfuscates, whatever the input: strings get smart obfuscation (emails keep their domain, phone and
 * card numbers their last four) plus `(hashed=<12 hex>)` when LOG_HASH_SECRET is set; numbers and dates are masked
 * the same way; arrays, Maps, Sets, objects and Errors are walked and EVERY leaf is masked. Until 0.0.334 an Error kept
 * its message and stack, a number passed through, and an object kept every value whose KEY didn't look like PII.
 * A RegExp is code, not data, and is formatted as d4l() formats it.
 */
export function d4lObfuscate(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  if (input instanceof RegExp) {
    return d4l(input, logOptions);
  }
  return redactWithSeen(input, logOptions, new WeakSet<object>());
}

/** A string's smart obfuscation, with the correlation hash when LOG_HASH_SECRET is set. */
function obfuscateString(input: string): string {
  const obfuscated = smartObfuscate(input);
  if (isPIISecureModeEnabled() && input.length > 10) {
    return `${obfuscated} (hashed=${hashPIIValue(input)})`;
  }
  return obfuscated;
}

/** An object or Map key is shown when it looks like a field name; any other key (an email, a name) is masked. */
const FIELD_NAME = /^[A-Za-z_$][A-Za-z0-9_$]{0,39}$/;

function redactWithSeen(input: any, logOptions: LogOptions, seen: WeakSet<object>): string {
  if (input == null || typeof input === 'boolean') {
    return d4l(input, logOptions);
  }
  if (input instanceof Date) {
    return obfuscateString(Number.isNaN(input.getTime()) ? 'Invalid Date' : input.toISOString());
  }
  if (typeof input !== 'object') {
    return obfuscateString(String(input));
  }
  if (seen.has(input)) {
    return '<cycle>';
  }
  seen.add(input);
  if (input instanceof Error) {
    return `${input.name}: ${redactWithSeen(input.message, logOptions, seen)} (Error)`;
  }
  if (Array.isArray(input)) {
    return formatArrayForLog(input, (item) => redactWithSeen(item, logOptions, seen));
  }
  const formatKey = (key: unknown): string => (typeof key === 'string' && FIELD_NAME.test(key) ? key : redactWithSeen(key, logOptions, seen));
  if (input instanceof Map) {
    const entries = Array.from(input.entries()).map(([key, value]) => `${formatKey(key)} => ${redactWithSeen(value, logOptions, seen)}`);
    return `Map(size=${input.size}) { ${entries.join(', ')} }`;
  }
  if (input instanceof Set) {
    return `Set(size=${input.size}) [${Array.from(input).map((item) => redactWithSeen(item, logOptions, seen)).join(', ')}]`;
  }
  const entries = Object.entries(input).map(([key, value]) => `${formatKey(key)}: ${redactWithSeen(value, logOptions, seen)}`);
  return `{ ${entries.join(', ')} } (object)`;
}

/**
 * Debug-for-logging for a value that identifies a person. NEVER returns the value in plaintext.
 *
 * Masked exactly as d4lObfuscate() masks (emails keep their domain, phone and card numbers their last four; object and
 * Map keys that aren't field names are masked too); the two names say which kind of value was withheld. When LOG_HASH_SECRET is SET, longer values also get `(hashed=<12 hex>)`, so two
 * log lines about the same person can be linked without naming them; when it is UNSET they are redacted all the same,
 * just without the hash. Arrays and objects are walked and EVERY leaf is treated as PII: the caller said the whole
 * value identifies someone, so a key name is not evidence that a value is safe. null, undefined and booleans identify
 * nobody and are formatted as d4l() formats them.
 *
 * Until 0.0.334 this returned d4l(input) -- the plain value -- whenever LOG_HASH_SECRET was unset, and for every
 * non-string input even when it was set.
 *
 * @example
 * logger.info(`User logged in: ${d4lPii(email)}`)
 * // Without LOG_HASH_SECRET: "User logged in: jo****@example.com"
 * // With LOG_HASH_SECRET:    "User logged in: jo****@example.com (hashed=abc123def456)"
 */
export function d4lPii(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  return redactWithSeen(input, logOptions, new WeakSet<object>());
}

/**
 * Formats an array the way d4l() does -- first element, an ellipsis, last element -- with each element formatted by
 * the given function.
 */
function formatArrayForLog(input: Array<any>, formatItem: (item: any) => string): string {
  const parts: string[] = [];
  if (input.length > 0) {
    parts.push(formatItem(input[0]));
  }
  if (input.length > 2) {
    parts.push(`…`);
  }
  if (input.length > 1) {
    parts.push(formatItem(input[input.length - 1]));
  }
  return `Array(len=${input.length}) [${parts.join(", ")}]`;
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
export const blurIfEnabled = d4lPii;  // historical name: it now blurs ALWAYS

// Short English-word aliases for maximum readability in log lines
export const fmt = d4l;               // format/decorate for logging (plain output)
export const pii = d4lPii;            // always redact; hash too when LOG_HASH_SECRET is set
export const safe = blurWhereNeeded;   // smart auto-detect PII and redact

/**
 * Short aliases for frequent use (all 3 characters for consistency):
 *
 * d4l - Direct/decorate for logging (plain output with type info)
 * p4l - Plain for logging (same as d4l)
 * b4l - Blur for logging (always obfuscates)
 * c4l - PII for logging (always redacts; hash too when LOG_HASH_SECRET is set)
 * s4l - Scan for logging (content-aware PII detection, always active)
 */
export const p4l = d4l;                // plain for logging (alias for d4l)
export const b4l = d4lObfuscate;       // blur for logging (always)
export const c4l = d4lPii;             // PII for logging (always redacts)
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