
import { AsyncLocalStorage } from "async_hooks";
const stathat = require('stathat');

const asyncLocalStorage = new AsyncLocalStorage();

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


class Logger {
  constructor(private readonly loggerName: string) {}

  private buildLogMsg(severity: string, msg: string, jsonContext: JSONContext): string {
    const messageParts = [];
    if (isTruelike(process.env.LOG_PREPEND_TIMESTAMP)) {
      messageParts.push(new Date().toUTCString())
    }
    messageParts.push(severity)
    // messageParts.push(JSON.stringify(jsonContext))
    messageParts.push(this.loggerName)
    messageParts.push(msg)

    try {
      const traceId = asyncLocalStorage.getStore();
      if (traceId != null) {
        jsonContext = Object.assign({}, jsonContext, {traceId});
      }
    } catch(err) {
      
    }
    

    messageParts.push(JSON.stringify(jsonContext))
    return messageParts.join(" ")
  }

  public trace(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_TRACE)) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public debug(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_DEBUG)) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public info(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_INFO)) {
      const completeMsg = this.buildLogMsg("[  INFO]", msg, jsonContext)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public notice(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[NOTICE]", msg, jsonContext)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }
  }

  public warn(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[  WARN]", msg, jsonContext)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }
  }

  public error(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (process.env.STATHAT_EZ_KEY != null && process.env.STATHAT_EZ_KEY.trim()?.length > 0 && process.env.STATHAT_ERROR_KEY != null && process.env.STATHAT_ERROR_KEY.trim()?.length > 0) {
      // TODO: Change this to run as a promise
      try {
        stathat.trackEZCount(process.env.STATHAT_EZ_KEY?.trim(), process.env.STATHAT_ERROR_KEY?.trim(), 1, function(status: any, json: any) {});
      } catch(err) {
        const stathatError = this.buildLogMsg("[STATHAT][ ERROR]", msg, jsonContext)
        console.log(stathatError)
      } 
    }    
    
    const completeMsg = this.buildLogMsg("[ ERROR]", msg, jsonContext)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }

  }
}

export function getLogger(loggerName: string): Logger {
  return LoggerFactory.getLogger(loggerName)
}

export function withTraceId(traceId: string, fn: () => any) {
  return asyncLocalStorage.run(traceId, fn);
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