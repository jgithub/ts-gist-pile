
import { tryGetEnvVar, resetEnvVarCache } from "../env/envUtil";
import { sendStatToKpitracks } from "../stat/statUtil";
import { context, trace, isSpanContextValid, Span } from '@opentelemetry/api';
import { sanitizePII } from './piiSanitizer';

let AsyncLocalStorage: any | undefined;

if (typeof window === "undefined" && typeof global !== "undefined") {
  const { AsyncLocalStorage: ALS } = require("async_hooks");
  AsyncLocalStorage = ALS;
}

let asyncLocalStorage: any | undefined;
if (AsyncLocalStorage != null) {
  asyncLocalStorage = new AsyncLocalStorage();
}

class LoggerFactory {
  private static mapOfLoggers: Map<string, Logger>;

  public static getLogger(loggerName: string): Logger {
    if (LoggerFactory.mapOfLoggers == null) {
      LoggerFactory.mapOfLoggers = new Map()
    }

    let logger: Logger = this.mapOfLoggers.get(loggerName) as Logger
    if (logger == null){
      logger = new Logger(loggerName)
      LoggerFactory.mapOfLoggers.set(loggerName, logger)
    }
    return logger
  }

  public static resetLoggerCache(): void {
    LoggerFactory.mapOfLoggers = new Map();
  }
}

type stringorstringfn = string | (() => string)

class Logger {
  constructor(private readonly loggerName: string) {}

  private buildLogMsg(severity: string, msg: stringorstringfn, jsonContext: JSONContext): string {
    if (isTruelike(tryGetEnvVar('LOG_USE_JSON_FORMAT'))) {
      return this.buildLogMsgJsonFormat(severity, msg, jsonContext);
    } else {
      return this.buildLogMsgPlainText(severity, msg, jsonContext);
    }
  }

  private buildLogMsgJsonFormat(severity: string, msg: stringorstringfn, jsonContext: JSONContext): string {
    const json: any = {}
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_PREPEND_TIMESTAMP'))) {
      json["at"] = new Date().toISOString()
    }

    severity = severity.replace(/[\[\]]/g, "").trim()

    json["lvl"] = severity
    json["logger"] = this.loggerName

    if (typeof msg === 'function') {
      json["msg"] = msg()
    } else {
      json["msg"] = msg
    }

    jsonContext = this.buildCompleteJsonContext(jsonContext)
    
    // testing
    // jsonContext["spanId"] = "from context"
    // json["spanId"] = "from orig"

    // In the merged JSON, the root context should take presedence over the jsonContext
    const mergedJson = { ...jsonContext, ...json }


    return JSON.stringify(mergedJson)
  }

  private buildCompleteJsonContext(jsonContext: JSONContext): JSONContext {
    if (asyncLocalStorage != null) {
      try {
        const storeInLocalStorage = asyncLocalStorage.getStore();
        if (storeInLocalStorage != null && typeof storeInLocalStorage === 'object') {
          const storeId = storeInLocalStorage.storeId;
          if (storeId != null) {
            jsonContext = Object.assign({}, jsonContext, { storeId });
          }
        }
      } catch (err) {
      }
    }


    const span = trace.getSpan(context.active());
    if (span) {
      const { traceId, spanId } = span.spanContext();
      // console.log(`traceId = '${traceId}', spanId = '${spanId}'`)
      // https://opentelemetry.io/docs/specs/otel/compatibility/logging_trace_context/#overview non-otlp JSON logs use trace_id, not traceId.
      jsonContext = Object.assign({}, jsonContext, { trace_id: traceId, span_id: spanId })
    } else {
      // console.log("No Span")
    }

    // Sanitize PII fields if LOG_HASH_SECRET is set
    jsonContext = sanitizePII(jsonContext);

    return jsonContext
  }


  private buildLogMsgPlainText(severity: string, msg: stringorstringfn, jsonContext: JSONContext): string {
    const messageParts = [];
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_PREPEND_TIMESTAMP'))) {
      messageParts.push(new Date().toUTCString())
    }
    messageParts.push(severity)
    // messageParts.push(JSON.stringify(jsonContext))
    messageParts.push(this.loggerName)

    if (typeof msg === 'function') {
      messageParts.push(msg())
    } else {
      messageParts.push(msg)
    }
    
    jsonContext = this.buildCompleteJsonContext(jsonContext)


    const wouldBeJsonContextString = JSON.stringify(jsonContext)
    if (wouldBeJsonContextString != null && wouldBeJsonContextString.length > 0 && wouldBeJsonContextString != "{}" && wouldBeJsonContextString != "{ }") {
      messageParts.push(wouldBeJsonContextString)
    }
    return messageParts.join(" ")
  }

  private writeLogMsgToTerminal(msg: string, ...extra: any[]): void {
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_TO_STDERR'))) {
      if (extra.length === 0) {
        console.error(msg)
      } else if (extra.length > 0) {
        console.error(msg, extra)
      }
    } else {
      if (extra.length === 0) {
        console.log(msg)
      } else if (extra.length > 0) {
        console.log(msg, extra)
      }
    }
  }

  public trace(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'TRACE')) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public debug(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'DEBUG')) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public info(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'INFO')) {
      const completeMsg = this.buildLogMsg("[  INFO]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public notice(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[NOTICE]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }


  public fatal(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (typeof process !== 'undefined' && process.env?.STATHAT_EZ_KEY != null && process.env?.STATHAT_EZ_KEY.trim()?.length > 0 && process.env?.STATHAT_FATAL_KEY != null && process.env?.STATHAT_FATAL_KEY.trim()?.length > 0) {

      const controller = new AbortController()
      // 1 second timeout:
      const timeoutId = setTimeout(() => controller.abort(), 750)

      const url = "https://api.stathat.com/ez"
      // This param should either be 'ezkey' or 'email'... I'm not sure which
      const ezKeyLabel = "ezkey" // vs email
      const requestBody = `stat=${process.env.STATHAT_FATAL_KEY?.trim()}&${ezKeyLabel}=${process.env.STATHAT_EZ_KEY?.trim()}&count=1`

      /*
       * % curl -v -d "stat=sisu _ERROR&email=ezkey&count=1" https://api.stathat.com/ez
       */

      // console.log(`Sending POST to Stathat url = '${url}',  requestBody = '${requestBody}'`)

      const beforeAt = new Date()
      // While still experimental, the global fetch API is available by default in Node.js 18
      fetch(url, { 
        method: 'POST', 
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal,
        body: requestBody
      }).then(response => {
        // completed request before timeout fired
        const deltaInMs = new Date().getTime() - beforeAt.getTime()
        // console.log(`Stathat fetch completed after ${deltaInMs} milliseconds,  with response = ${d4l(response)}`)

        // If you only wanted to timeout the request, not the response, add:
        clearTimeout(timeoutId)
      }).catch(err => {
        // console.log(`[STATHAT][ ERROR] Reason: ${d4l(err)}`)
      })
    }    
    
    if (typeof process !== 'undefined' && process.env?.KPITRACKS_FATAL_KEY != null && process.env?.KPITRACKS_FATAL_KEY?.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_FATAL_KEY?.trim()}&count=1`)
    }
    const completeMsg = this.buildLogMsg("[ FATAL][ ERROR]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }

  public warn(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (typeof process !== 'undefined' && process.env?.STATHAT_EZ_KEY != null && process.env?.STATHAT_EZ_KEY?.trim()?.length > 0 && process.env?.STATHAT_WARN_KEY != null && process.env?.STATHAT_WARN_KEY?.trim()?.length > 0) {

      const controller = new AbortController()
      // 1 second timeout:
      const timeoutId = setTimeout(() => controller.abort(), 750)

      const url = "https://api.stathat.com/ez"
      // This param should either be 'ezkey' or 'email'... I'm not sure which
      const ezKeyLabel = "ezkey" // vs email
      const requestBody = `stat=${process.env.STATHAT_WARN_KEY?.trim()}&${ezKeyLabel}=${process.env.STATHAT_EZ_KEY?.trim()}&count=1`

      /*
       * % curl -v -d "stat=sisu _ERROR&email=ezkey&count=1" https://api.stathat.com/ez
       */

      // console.log(`Sending POST to Stathat url = '${url}',  requestBody = '${requestBody}'`)

      const beforeAt = new Date()
      // While still experimental, the global fetch API is available by default in Node.js 18
      fetch(url, { 
        method: 'POST', 
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal,
        body: requestBody
      }).then(response => {
        // completed request before timeout fired
        const deltaInMs = new Date().getTime() - beforeAt.getTime()
        // console.log(`Stathat fetch completed after ${deltaInMs} milliseconds,  with response = ${d4l(response)}`)

        // If you only wanted to timeout the request, not the response, add:
        clearTimeout(timeoutId)
      }).catch(err => {
        // console.log(`[STATHAT][ ERROR] Reason: ${d4l(err)}`)
      })
    }    
    
    if (typeof process !== 'undefined' && process.env?.KPITRACKS_WARN_KEY != null && process.env?.KPITRACKS_WARN_KEY?.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_WARN_KEY?.trim()}&count=1`)
    }
    const completeMsg = this.buildLogMsg("[  WARN]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }


  public error(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    // console.log(`error(): STATHAT_EZ_KEY = '${process.env.STATHAT_EZ_KEY}',  STATHAT_ERROR_KEY = '${process.env.STATHAT_ERROR_KEY}'`)

    if (typeof process !== 'undefined' && process.env?.STATHAT_EZ_KEY != null && process.env?.STATHAT_EZ_KEY?.trim()?.length > 0 && process.env?.STATHAT_ERROR_KEY != null && process.env?.STATHAT_ERROR_KEY?.trim()?.length > 0) {
      // TODO: Change this to run as a promise
      // try {
        // stathat.trackEZCount(process.env.STATHAT_EZ_KEY?.trim(), process.env.STATHAT_ERROR_KEY?.trim(), 1, function(status: any, json: any) {});


      const controller = new AbortController()
      // 1 second timeout:
      const timeoutId = setTimeout(() => controller.abort(), 750)

      const url = "https://api.stathat.com/ez"
      // This param should either be 'ezkey' or 'email'... I'm not sure which
      const ezKeyLabel = "ezkey" // vs email
      const requestBody = `stat=${process.env.STATHAT_ERROR_KEY?.trim()}&${ezKeyLabel}=${process.env.STATHAT_EZ_KEY?.trim()}&count=1`

      /*
       * % curl -v -d "stat=sisu _ERROR&email=ezkey&count=1" https://api.stathat.com/ez
       */

      // console.log(`Sending POST to Stathat url = '${url}',  requestBody = '${requestBody}'`)

      const beforeAt = new Date()
      // While still experimental, the global fetch API is available by default in Node.js 18
      fetch(url, { 
        method: 'POST', 
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal,
        body: requestBody
      }).then(response => {
        // completed request before timeout fired
        const deltaInMs = new Date().getTime() - beforeAt.getTime()
        // console.log(`Stathat fetch completed after ${deltaInMs} milliseconds,  with response = ${d4l(response)}`)

        // If you only wanted to timeout the request, not the response, add:
        clearTimeout(timeoutId)
      }).catch(err => {
        // console.log(`[STATHAT][ ERROR] Reason: ${d4l(err)}`)
      })

      // } catch(err) {
      //   const stathatError = this.buildLogMsg("[STATHAT][ ERROR]", msg, jsonContext)
      //   console.log(stathatError)
      // } 
    }    
    
    if (typeof process !== 'undefined' && process.env?.KPITRACKS_ERROR_KEY != null && process.env?.KPITRACKS_ERROR_KEY?.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_ERROR_KEY?.trim()}&count=1`)
    }

    const completeMsg = this.buildLogMsg("[ ERROR]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }
}

export function getLogger(loggerName: string): Logger {
  return LoggerFactory.getLogger(loggerName)
} 

export function withStoreId(storeId: string, fn: () => any) {
  if (typeof asyncLocalStorage != 'undefined' && asyncLocalStorage != null) {
    let storeInLocalStorage: { storeId?: string } = asyncLocalStorage.getStore();
    if (storeInLocalStorage == null) {
      storeInLocalStorage = {}
    }
    storeInLocalStorage.storeId = storeId;

    return asyncLocalStorage.run(storeInLocalStorage, fn);
  } else {
    return fn();
  }
}

function isTruelike(input: boolean | string | number | undefined): boolean {
  if (input == null) {
    return false
  }
  if ([
    'true', 'yes', 't', 'y', '1'
  ].includes(input.toString().trim().toLowerCase())) {
    return true
  }
  return false
}

type JSONContext = { [key: string]: any }

// Log level configuration types
type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'FATAL';

interface LogLevelRule {
  pattern: string;
  level: LogLevel;
}

/**
 * Global log level rules configuration.
 *
 * You can directly modify this from your application code:
 *
 * ```typescript
 * import { LOG_RULES } from 'ts-gist-pile';
 *
 * // Add rules
 * LOG_RULES.levels.push(
 *   { pattern: 'api.users', level: 'TRACE' },
 *   { pattern: 'api.*', level: 'DEBUG' },
 *   { pattern: '*', level: 'INFO' }
 * );
 *
 * // Or replace entirely
 * LOG_RULES.levels = [
 *   { pattern: 'api.*', level: 'DEBUG' }
 * ];
 * ```
 *
 * Rules are evaluated in order (first match wins).
 */
export const LOG_RULES: { levels: LogLevelRule[] } = {
  levels: []
};

/**
 * Determines if a logger name matches a pattern.
 * Supports:
 * - Exact matches: "api.users" matches "api.users"
 * - Prefix wildcards: "*.users" matches "api.users", "db.users"
 * - Suffix wildcards: "api.*" matches "api.users", "api.products"
 * - Middle wildcards: "api.*.service" matches "api.users.service", "api.products.service"
 *
 * @param loggerName The logger name to match
 * @param pattern The pattern to match against
 * @returns true if the logger name matches the pattern
 */
function matchesPattern(loggerName: string, pattern: string): boolean {
  // Exact match
  if (pattern === loggerName) {
    return true;
  }

  // No wildcard - must be exact match (already checked above)
  if (!pattern.includes('*')) {
    return false;
  }

  // Convert pattern to regex
  // Escape special regex characters except *
  const regexPattern = pattern
    .split('*')
    .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(loggerName);
}

/**
 * Loads log level rules from a JavaScript file using require().
 * The file should export an object with a 'rules' property.
 *
 * @param filePath Absolute or relative path to the JS file
 * @returns Array of log level rules, or null if file cannot be loaded
 */
function loadRulesFromJsFile(filePath: string): LogLevelRule[] | null {
  if (typeof require === 'undefined') {
    return null; // Not in Node.js environment
  }

  try {
    // Use require to load at runtime (not bundled)
    // resolve the path relative to process.cwd()
    const path = require('path');
    const resolvedPath = path.resolve(process.cwd(), filePath);

    // Delete from cache to allow hot-reloading on restart
    delete require.cache[resolvedPath];

    const config = require(resolvedPath);

    if (!config || !Array.isArray(config.rules)) {
      console.error(`[LOG CONFIG] ${filePath} must export an object with a 'rules' array property`);
      return null;
    }

    // Validate rules
    const validRules = config.rules.filter((rule: any) => {
      if (typeof rule !== 'object' || rule === null) {
        console.error('[LOG CONFIG] Invalid rule (not an object):', rule);
        return false;
      }
      if (typeof rule.pattern !== 'string' || typeof rule.level !== 'string') {
        console.error('[LOG CONFIG] Invalid rule (missing pattern or level):', rule);
        return false;
      }
      return true;
    });

    console.log(`[LOG CONFIG] Loaded ${validRules.length} log level rules from ${filePath}`);
    return validRules;
  } catch (err: any) {
    // File not found or other error - this is OK, just return null
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(`[LOG CONFIG] Error loading log level rules from ${filePath}:`, err.message);
    }
    return null;
  }
}

/**
 * Parses log level rules from multiple sources in priority order:
 * 1. LOG_RULES.levels (directly set in code)
 * 2. JavaScript file specified in LOG_LEVEL_RULES_FILE env var
 * 3. Default JavaScript file locations (./log-level-rules.js, ./config/log-level-rules.js)
 * 4. JSON string in LOG_LEVEL_RULES env var
 *
 * Rules are evaluated in order (first match wins), so put the most
 * specific patterns first and general fallback patterns last.
 *
 * Example usage in your app:
 * ```typescript
 * import { LOG_RULES } from 'ts-gist-pile';
 *
 * LOG_RULES.levels.push(
 *   { pattern: "api.users.*", level: "DEBUG" },
 *   { pattern: "api.*", level: "INFO" },
 *   { pattern: "*", level: "WARN" }
 * );
 * ```
 *
 * @returns Array of log level rules, or empty array if not configured
 */
function parseLogLevelRules(): LogLevelRule[] {
  // Priority 1: Directly set via LOG_RULES export
  if (LOG_RULES.levels.length > 0) {
    return LOG_RULES.levels;
  }

  if (typeof process === 'undefined') {
    return [];
  }

  // Priority 2: Explicit file path from env var
  const configFilePath = tryGetEnvVar('LOG_LEVEL_RULES_FILE');
  if (configFilePath) {
    const rules = loadRulesFromJsFile(configFilePath);
    if (rules !== null) {
      return rules;
    }
    console.error(`[LOG CONFIG] LOG_LEVEL_RULES_FILE specified (${configFilePath}) but could not be loaded`);
  }

  // Priority 3: Default file locations
  const defaultLocations = [
    './log-level-rules.js',
    './config/log-level-rules.js'
  ];

  for (const location of defaultLocations) {
    const rules = loadRulesFromJsFile(location);
    if (rules !== null) {
      return rules;
    }
  }

  // Priority 4: JSON from env var (backward compatibility)
  const rulesJson = tryGetEnvVar('LOG_LEVEL_RULES');
  if (!rulesJson || rulesJson.trim().length === 0) {
    return [];
  }

  try {
    const rules = JSON.parse(rulesJson);
    if (!Array.isArray(rules)) {
      console.error('[LOG CONFIG] LOG_LEVEL_RULES must be a JSON array');
      return [];
    }

    return rules.filter((rule: any) => {
      if (typeof rule !== 'object' || rule === null) {
        console.error('[LOG CONFIG] Invalid rule (not an object):', rule);
        return false;
      }
      if (typeof rule.pattern !== 'string' || typeof rule.level !== 'string') {
        console.error('[LOG CONFIG] Invalid rule (missing pattern or level):', rule);
        return false;
      }
      return true;
    });
  } catch (err) {
    console.error('[LOG CONFIG] Failed to parse LOG_LEVEL_RULES:', err);
    return [];
  }
}

/**
 * Finds the first matching rule for a logger name.
 * Rules are evaluated in order from first to last.
 * The first rule that matches is used (first match wins).
 *
 * This allows users to put the most specific rules at the front
 * and more general fallback rules towards the back.
 *
 * Example:
 * [
 *   {"pattern": "api.users.controller", "level": "TRACE"},  // Most specific
 *   {"pattern": "api.users.*", "level": "DEBUG"},           // More general
 *   {"pattern": "api.*", "level": "INFO"},                  // Even more general
 *   {"pattern": "*", "level": "WARN"}                       // Fallback
 * ]
 *
 * @param loggerName The logger name to find a rule for
 * @param rules The array of log level rules (in priority order)
 * @returns The matching log level, or null if no rule matches
 */
function findMatchingLogLevel(loggerName: string, rules: LogLevelRule[]): LogLevel | null {
  if (rules.length === 0) {
    return null;
  }

  // Find the first matching rule
  for (const rule of rules) {
    if (matchesPattern(loggerName, rule.pattern)) {
      return rule.level;
    }
  }

  return null;
}

// Cache parsed rules to avoid reparsing on every log call
let cachedLogLevelRules: LogLevelRule[] | null = null;

/**
 * Gets the configured log level rules, using a cache to avoid reparsing.
 * @returns Array of log level rules
 */
function getLogLevelRules(): LogLevelRule[] {
  if (cachedLogLevelRules === null) {
    cachedLogLevelRules = parseLogLevelRules();
  }
  return cachedLogLevelRules;
}

/**
 * Resets the cached log level rules and logger instances.
 * This is primarily useful for testing, to force re-reading the configuration
 * and recreating logger instances with the new configuration.
 *
 * Note: This does NOT reset the environment variable memoization cache,
 * as that would cause tryGetEnvVar to log debug messages again.
 * @internal
 */
export function resetLogLevelRulesCache(): void {
  cachedLogLevelRules = null;
  LoggerFactory.resetLoggerCache();
}

/**
 * Determines if a specific log level should be enabled for a logger.
 *
 * Priority order:
 * 1. Pattern-based rules (LOG_LEVEL_RULES) - most specific match wins
 * 2. Legacy environment variables (LOG_TRACE, LOG_DEBUG, LOG_INFO)
 * 3. Default behavior (NOTICE and above always enabled)
 *
 * @param loggerName The logger name
 * @param level The log level to check
 * @returns true if the log level is enabled
 */
function isLogLevelEnabled(loggerName: string, level: LogLevel): boolean {
  // Check for pattern-based configuration first
  const rules = getLogLevelRules();
  const configuredLevel = findMatchingLogLevel(loggerName, rules);

  if (configuredLevel !== null) {
    // Use pattern-based configuration
    const levelHierarchy: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARN', 'ERROR', 'FATAL'];
    const configuredIndex = levelHierarchy.indexOf(configuredLevel);
    const requestedIndex = levelHierarchy.indexOf(level);
    return requestedIndex >= configuredIndex;
  }

  // Fall back to legacy environment variable checks
  if (typeof process === 'undefined') {
    // In browser, only NOTICE and above are enabled by default
    return ['NOTICE', 'WARN', 'ERROR', 'FATAL'].includes(level);
  }

  // Legacy environment variable behavior
  switch (level) {
    case 'TRACE':
      return isTruelike(tryGetEnvVar('LOG_TRACE'));
    case 'DEBUG':
      return isTruelike(tryGetEnvVar('LOG_DEBUG'));
    case 'INFO':
      return isTruelike(tryGetEnvVar('LOG_INFO'));
    case 'NOTICE':
    case 'WARN':
    case 'ERROR':
    case 'FATAL':
      return true;
    default:
      return false;
  }
}