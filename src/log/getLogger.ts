
import { tryGetEnvVar, resetEnvVarCache, isEagerAutoSanitizeEnabled } from "../env/environmentUtil";
import { sendStatToKpitracks } from "../stat/statUtil";
import { context as otelContext, trace, isSpanContextValid, Span } from '@opentelemetry/api';
import { sanitizePII, eagerSanitizePII } from './piiSanitizer';

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

  private buildLogMsg(severity: string, msg: stringorstringfn, context: JSONContext | undefined | Error): string {
    if (isTruelike(tryGetEnvVar('LOG_USE_JSON_FORMAT'))) {
      return this.buildLogMsgJsonFormat(severity, msg, context);
    } else {
      return this.buildLogMsgPlainText(severity, msg, context);
    }
  }

  private buildLogMsgJsonFormat(severity: string, msg: stringorstringfn, context: JSONContext | undefined | Error): string {
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

    context = this.buildCompleteJsonContext(context)
    
    // testing
    // context["spanId"] = "from context"
    // json["spanId"] = "from orig"

    // In the merged JSON, the root context should take presedence over the context
    const mergedJson = { ...context, ...json }


    return JSON.stringify(mergedJson)
  }

  private buildCompleteJsonContext(context: JSONContext | undefined | Error): JSONContext {
    // Convert Error to JSONContext
    let jsonContext: JSONContext = {};
    if (context instanceof Error) {
      jsonContext = {
        error: context.message,
        errorName: context.name,
        errorStack: context.stack
      };
    } else if (context != null) {
      jsonContext = { ...context };
    }

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


    const span = trace.getSpan(otelContext.active());
    if (span) {
      const { traceId, spanId } = span.spanContext();
      // console.log(`traceId = '${traceId}', spanId = '${spanId}'`)
      // https://opentelemetry.io/docs/specs/otel/compatibility/logging_trace_context/#overview non-otlp JSON logs use trace_id, not traceId.
      jsonContext = Object.assign({}, jsonContext, { trace_id: traceId, span_id: spanId })
    } else {
      // console.log("No Span")
    }

    // Sanitize PII fields based on environment configuration
    if (isEagerAutoSanitizeEnabled()) {
      // LOG_EAGER_AUTO_SANITIZE: use eagerSanitizePII (keeps field names, blurs values)
      jsonContext = eagerSanitizePII(jsonContext);
    } else if (tryGetEnvVar('LOG_HASH_SECRET')) {
      // LOG_HASH_SECRET only: use sanitizePII (renames to _hash, removes original)
      jsonContext = sanitizePII(jsonContext);
    }

    return jsonContext
  }


  private buildLogMsgPlainText(severity: string, msg: stringorstringfn, context: JSONContext | undefined | Error): string {
    const messageParts = [];
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_PREPEND_TIMESTAMP'))) {
      messageParts.push(new Date().toUTCString())
    }
    messageParts.push(severity)
    // messageParts.push(JSON.stringify(context))
    messageParts.push(this.loggerName)

    if (typeof msg === 'function') {
      messageParts.push(msg())
    } else {
      messageParts.push(msg)
    }
    
    context = this.buildCompleteJsonContext(context)


    const wouldBeJsonContextString = JSON.stringify(context)
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

  public trace(msg: stringorstringfn, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'TRACE')) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg, context)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public debug(msg: stringorstringfn, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'DEBUG')) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg, context)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public info(msg: stringorstringfn, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'INFO')) {
      const completeMsg = this.buildLogMsg("[  INFO]", msg, context)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public notice(msg: stringorstringfn, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (isLogLevelEnabled(this.loggerName, 'NOTICE')) {
      const completeMsg = this.buildLogMsg("[NOTICE]", msg, context)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }


  public fatal(msg: stringorstringfn, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (!isLogLevelEnabled(this.loggerName, 'FATAL')) {
      return;
    }

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
    const completeMsg = this.buildLogMsg("[ FATAL][ ERROR]", msg, context)
    this.writeLogMsgToTerminal(completeMsg)
  }

  public warn(msg: string, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (!isLogLevelEnabled(this.loggerName, 'WARN')) {
      return;
    }

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
    const completeMsg = this.buildLogMsg("[  WARN]", msg, context)
    this.writeLogMsgToTerminal(completeMsg)
  }


  public error(msg: string, context: JSONContext | Error | undefined = undefined, ...extra: any[]): void {
    if (!isLogLevelEnabled(this.loggerName, 'ERROR')) {
      return;
    }

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
      //   const stathatError = this.buildLogMsg("[STATHAT][ ERROR]", msg, context)
      //   console.log(stathatError)
      // }
    }

    if (typeof process !== 'undefined' && process.env?.KPITRACKS_ERROR_KEY != null && process.env?.KPITRACKS_ERROR_KEY?.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_ERROR_KEY?.trim()}&count=1`)
    }

    const completeMsg = this.buildLogMsg("[ ERROR]", msg, context)
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
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogLevelRule {
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
 * **Priority:** Rules are evaluated in order (first match wins).
 * If a logger name matches ANY pattern in LOG_RULES.levels, that rule
 * takes complete precedence over legacy env vars (LOG_DEBUG, LOG_TRACE, etc.),
 * regardless of whether the rule is more or less restrictive.
 *
 * **Example:**
 * ```typescript
 * LOG_RULES.levels = [{ pattern: '*', level: 'WARN' }];
 * process.env.LOG_DEBUG = '1';  // This is IGNORED for all loggers
 *
 * const logger = getLogger('MyService');
 * logger.debug('test');  // Won't appear (WARN level from rule)
 * logger.warn('test');   // Will appear
 * ```
 *
 * Only loggers that don't match any pattern will fall back to env vars.
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
 * Parses log level rules from LOG_RULES.levels.
 *
 * Rules are evaluated in order (first match wins), so put the most
 * specific patterns first and general fallback patterns last.
 *
 * Usage in your app:
 * ```typescript
 * // In your app's config/log-levels.ts
 * import { LOG_RULES } from 'ts-gist-pile';
 *
 * LOG_RULES.levels = [
 *   { pattern: "api.users.*", level: "DEBUG" },
 *   { pattern: "api.*", level: "INFO" },
 *   { pattern: "*", level: "WARN" }
 * ];
 *
 * // Then in your app entry point:
 * import './config/log-levels';  // Load FIRST, before creating loggers
 * ```
 *
 * @returns Array of log level rules, or empty array if not configured
 */
function parseLogLevelRules(): LogLevelRule[] {
  return LOG_RULES.levels;
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
  cachedParsedLogLevel = undefined;
  LoggerFactory.resetLoggerCache();
}

// Cache for parsed LOG_LEVEL to avoid repeated parsing and warnings
let cachedParsedLogLevel: LogLevel | null | undefined = undefined;

/**
 * Parses the LOG_LEVEL environment variable and returns the corresponding LogLevel.
 *
 * @returns The parsed log level, or null if LOG_LEVEL is not set or invalid
 */
function parseLogLevelFromEnv(): LogLevel | null {
  if (cachedParsedLogLevel !== undefined) {
    return cachedParsedLogLevel;
  }

  const logLevelValue = tryGetEnvVar('LOG_LEVEL');
  if (!logLevelValue) {
    cachedParsedLogLevel = null;
    return null;
  }

  const normalizedValue = logLevelValue.trim().toUpperCase();
  const validLevels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARN', 'ERROR', 'FATAL'];

  if (validLevels.includes(normalizedValue as LogLevel)) {
    cachedParsedLogLevel = normalizedValue as LogLevel;
    return cachedParsedLogLevel;
  }

  // Invalid LOG_LEVEL value - log a warning (only once due to caching)
  console.log(`ts-gist-pile: Invalid LOG_LEVEL value: '${logLevelValue}'. Valid values are: ${validLevels.join(', ')}`);
  cachedParsedLogLevel = null;
  return null;
}

/**
 * Determines if a specific log level should be enabled for a logger.
 *
 * Priority order:
 * 1. Pattern-based rules (LOG_RULES.levels) - If ANY pattern matches, uses that rule exclusively
 * 2. Individual level environment variables (LOG_TRACE, LOG_DEBUG, LOG_INFO)
 * 3. LOG_LEVEL environment variable (sets multiple levels at once)
 * 4. Default behavior (NOTICE and above always enabled)
 *
 * Individual level env vars override LOG_LEVEL. For example:
 * - LOG_LEVEL=trace LOG_TRACE=0 → trace is disabled, but debug/info/etc. are enabled
 * - LOG_LEVEL=trace LOG_DEBUG=0 → trace is enabled, debug is disabled, info/etc. are enabled
 *
 * IMPORTANT: If a pattern matches in LOG_RULES.levels, the rule takes complete precedence
 * over all env vars, regardless of whether it's more or less restrictive.
 *
 * Example:
 * ```
 * LOG_RULES.levels = [{ pattern: '*', level: 'WARN' }];
 * process.env.LOG_DEBUG = '1';  // IGNORED - rule matches all loggers
 *
 * getLogger('MyService').debug('test');  // Won't appear (WARN from rule)
 * ```
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

  // Fall back to environment variable checks
  if (typeof process === 'undefined') {
    // In browser, only NOTICE and above are enabled by default
    return ['NOTICE', 'WARN', 'ERROR', 'FATAL'].includes(level);
  }

  // Check individual level env vars first (they override LOG_LEVEL)
  let individualLevelSet = false;
  let individualLevelEnabled = false;

  switch (level) {
    case 'TRACE':
      const traceEnv = tryGetEnvVar('LOG_TRACE');
      if (traceEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(traceEnv);
      }
      break;
    case 'DEBUG':
      const debugEnv = tryGetEnvVar('LOG_DEBUG');
      if (debugEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(debugEnv);
      }
      break;
    case 'INFO':
      const infoEnv = tryGetEnvVar('LOG_INFO');
      if (infoEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(infoEnv);
      }
      break;
    case 'NOTICE':
      const noticeEnv = tryGetEnvVar('LOG_NOTICE');
      if (noticeEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(noticeEnv);
      }
      break;
    case 'WARN':
      const warnEnv = tryGetEnvVar('LOG_WARN');
      if (warnEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(warnEnv);
      }
      break;
    case 'ERROR':
      const errorEnv = tryGetEnvVar('LOG_ERROR');
      if (errorEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(errorEnv);
      }
      break;
    case 'FATAL':
      const fatalEnv = tryGetEnvVar('LOG_FATAL');
      if (fatalEnv !== undefined) {
        individualLevelSet = true;
        individualLevelEnabled = isTruelike(fatalEnv);
      }
      break;
  }

  // If an individual level env var was set, use that (it overrides LOG_LEVEL)
  if (individualLevelSet) {
    return individualLevelEnabled;
  }

  // Check LOG_LEVEL env var
  const logLevel = parseLogLevelFromEnv();
  if (logLevel !== null) {
    const levelHierarchy: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARN', 'ERROR', 'FATAL'];
    const configuredIndex = levelHierarchy.indexOf(logLevel);
    const requestedIndex = levelHierarchy.indexOf(level);
    return requestedIndex >= configuredIndex;
  }

  // Default behavior: NOTICE and above are always enabled
  return ['NOTICE', 'WARN', 'ERROR', 'FATAL'].includes(level);
}