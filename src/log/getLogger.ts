
// import { AsyncLocalStorage } from "async_hooks";
import { sendStatToKpitracks } from "../stat/statUtil";

// const asyncLocalStorage = new AsyncLocalStorage();

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

    // try {
    //   const traceId = asyncLocalStorage.getStore();
    //   if (traceId != null) {
    //     jsonContext = Object.assign({}, jsonContext, {traceId});
    //   }
    // } catch(err) {
      
    // }
    

    const wouldBeJsonContextString = JSON.stringify(jsonContext)
    if (wouldBeJsonContextString != null && wouldBeJsonContextString.length > 0 && wouldBeJsonContextString != "{}" && wouldBeJsonContextString != "{ }") {
      messageParts.push(wouldBeJsonContextString)
    }
    return messageParts.join(" ")
  }

  private writeLogMsgToTerminal(msg: string, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_TO_STDERR)) {
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

  public trace(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_TRACE)) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public debug(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_DEBUG)) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public info(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_INFO)) {
      const completeMsg = this.buildLogMsg("[  INFO]", msg, jsonContext)
      this.writeLogMsgToTerminal(completeMsg)
    }
  }

  public notice(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[NOTICE]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }

  public warn(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    if (process.env.KPITRACKS_WARN_KEY != null && process.env.KPITRACKS_WARN_KEY.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_WARN_KEY?.trim()}&count=1`)
    }
    const completeMsg = this.buildLogMsg("[  WARN]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)
  }

  public error(msg: string, jsonContext: JSONContext = {}, ...extra: any[]): void {
    // console.log(`error(): STATHAT_EZ_KEY = '${process.env.STATHAT_EZ_KEY}',  STATHAT_ERROR_KEY = '${process.env.STATHAT_ERROR_KEY}'`)

    if (process.env.STATHAT_EZ_KEY != null && process.env.STATHAT_EZ_KEY.trim()?.length > 0 && process.env.STATHAT_ERROR_KEY != null && process.env.STATHAT_ERROR_KEY.trim()?.length > 0) {
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
    
    if (process.env.KPITRACKS_ERROR_KEY != null && process.env.KPITRACKS_ERROR_KEY.trim()?.length > 0) {
      sendStatToKpitracks(`stat=${process.env.KPITRACKS_ERROR_KEY?.trim()}&count=1`)
    }

    const completeMsg = this.buildLogMsg("[ ERROR]", msg, jsonContext)
    this.writeLogMsgToTerminal(completeMsg)

  }
}

export function getLogger(loggerName: string): Logger {
  return LoggerFactory.getLogger(loggerName)
}

// export function withTraceId(traceId: string, fn: () => any) {
//   return asyncLocalStorage.run(traceId, fn);
// }

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