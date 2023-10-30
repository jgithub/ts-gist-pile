

class LogFactory {
  private static mapOfLoggers: Map<string, Logger>;

  public static getLogger(loggerName: string): Logger {
    if (LogFactory.mapOfLoggers == null) {
      LogFactory.mapOfLoggers = new Map()
    }

    let logger: Logger = this.mapOfLoggers.get(loggerName) as Logger
    if (logger == null){
      logger = new Logger(loggerName)
      LogFactory.mapOfLoggers.set(loggerName, logger)
    }
    return logger
  }
}




class Logger {
  constructor(private readonly loggerName: string) {}

  private buildLogMsg(severity: string, msg: string): string {
    const messageParts = [];
    if (isTruelike(process.env.LOG_PREPEND_TIMESTAMP)) {
      messageParts.push(new Date().toUTCString())
    }
    messageParts.push(this.loggerName)
    messageParts.push(severity)
    messageParts.push(msg)

    return messageParts.join(" ")
  }

  public trace(msg: string, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_TRACE)) {
      const completeMsg = this.buildLogMsg("[ TRACE]", msg)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public debug(msg: string, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_DEBUG)) {
      const completeMsg = this.buildLogMsg("[ DEBUG]", msg)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public info(msg: string, ...extra: any[]): void {
    if (isTruelike(process.env.LOG_INFO)) {
      const completeMsg = this.buildLogMsg("[  INFO]", msg)
      if (extra.length === 0) {
        console.log(completeMsg)
      } else if (extra.length > 0) {
        console.log(completeMsg, extra)
      }
    }
  }

  public notice(msg: string, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[NOTICE]", msg)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }
  }

  public warn(msg: string, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[  WARN]", msg)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }
  }

  public error(msg: string, ...extra: any[]): void {
    const completeMsg = this.buildLogMsg("[ ERROR]", msg)
    if (extra.length === 0) {
      console.log(completeMsg)
    } else if (extra.length > 0) {
      console.log(completeMsg, extra)
    }
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