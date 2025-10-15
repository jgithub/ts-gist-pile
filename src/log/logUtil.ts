import { safeStringify } from "../string/safeStringify"
import { isPIISecureModeEnabled, hashPIIValue } from "./piiSanitizer"

export function d4l(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  if (typeof input === 'undefined') {
    return "<undefined> (undefined)"
  }
  else if (input == null) {
    return "<null> (null)"
  }
  else if (typeof input === 'string') {
    if (logOptions.obfuscate) {
      if (input.length > 36) {
        return `****${input.substring(input.length-4)}`
      }
      else if (input.length > 26) {
        return `****${input.substring(input.length-3)}`
      }
      else if (input.length > 16) {
        return `****${input.substring(input.length-2)}`
      }
      else if (input.length > 10) {
        return `****${input.substring(input.length-1)}`
      }
      return "****"
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
    if (typeof ((input as any).toDebugString) === 'function' ) {
      return (input as any).toDebugString() + " (object; via toDebugString())"
    }
    if (typeof ((input as any).toLogString) === 'function' ) {
      return (input as any).toLogString() + " (object; via toLogString())"
    }
    // Do yourself a huge favor and don't mess with toJSON
    // if (typeof ((input as any).toJSON) === 'function' ) {
    //   const whateverToJSONReturns = (input as any).toJSON()
    //   if (typeof whateverToJSONReturns === 'string') {
    //     return whateverToJSONReturns
    //   }
    // }

    if (typeof ((input as any).asJson) === 'function' ) {
      const whateverAsJsonReturns = (input as any).asJson()
      // return whateverAsJsonReturns
      try {
        return localSafeStringify(whateverAsJsonReturns) || `${input}`
      } catch (err){}
    }
    try {
      return localSafeStringify(input) + " (object)"
    } catch (err){}
  }
  return `${input}`
}

export function d4lObfuscate(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}) {
  return d4l(input, { ...logOptions, obfuscate: true })
}

/**
 * Debug-for-logging for PII (Personally Identifiable Information) values.
 *
 * When LOG_HASH_SECRET is UNSET:
 *   - Behaves exactly like d4l() - logs the value normally
 *
 * When LOG_HASH_SECRET is SET:
 *   - Returns a hashed version of the value for PII-secure logging
 *   - Hash is consistent (same input = same hash)
 *   - Hash is irreversible (cannot recover original value)
 *
 * Use this for values that might contain PII (emails, user IDs, etc.)
 *
 * @example
 * logger.info(`User logged in: ${d4lPii(userId)}`)
 * // Without LOG_HASH_SECRET: "User logged in: 'user-12345' (string, 10)"
 * // With LOG_HASH_SECRET: "User logged in: 1c62cfe7d8b3 (hashed)"
 */
export function d4lPii(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}): string {
  if (!isPIISecureModeEnabled()) {
    // PII mode not enabled - use regular d4l
    return d4l(input, logOptions);
  }

  // PII mode enabled - hash the value
  if (input == null) {
    return hashPIIValue(input) + " (hashed)";
  }

  // Convert input to string for hashing
  let valueToHash: string;
  if (typeof input === 'string') {
    valueToHash = input;
  } else if (typeof input === 'number' || typeof input === 'boolean') {
    valueToHash = String(input);
  } else if (input instanceof Error) {
    valueToHash = input.message;
  } else if (typeof input === 'object') {
    try {
      valueToHash = JSON.stringify(input);
    } catch (err) {
      valueToHash = String(input);
    }
  } else {
    valueToHash = String(input);
  }

  return hashPIIValue(valueToHash) + " (hashed)";
}

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