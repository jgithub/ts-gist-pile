
import { tryGetEnvVar } from "../env/internalEnvUtil";
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
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_TRACE'))) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public debug(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_DEBUG'))) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public info(msg: stringorstringfn, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (typeof process !== 'undefined' && isTruelike(tryGetEnvVar('LOG_INFO'))) {
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