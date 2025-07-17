(function (global) {
  const TsGistPile = {};

  TsGistPile.VERSION = "0.0.1";
  TsGistPile.LOG_TRACE = false;
  TsGistPile.LOG_DEBUG = false;
  TsGistPile.LOG_INFO = false;

  TsGistPile.booleanUtil = (function () {
    function isTruelike(input) {
      if (input == null) {
        return false;
      }
      if ([
        'true', 'yes', 't', 'y', '1'
      ].includes(input.toString().trim().toLowerCase())) {
        return true;
      }
      return false;
    }
  
    return {
      isTruelike: isTruelike
    };
  })();


  TsGistPile.LoggerFactory = (function () {
    const mapOfLoggers = new Map();

    function getLogger(loggerName) {
      let logger = mapOfLoggers.get(loggerName);
      if (!logger) {
        logger = new Logger(loggerName);
        mapOfLoggers.set(loggerName, logger);
      }
      return logger;
    }

    return {
      getLogger: getLogger,
    };
  })();

  function Logger(loggerName) {
    this.loggerName = loggerName;

    this.buildLogMsg = function (severity, msg, jsonContext) {
      const messageParts = [];
      messageParts.push(severity);
      messageParts.push(this.loggerName);
      messageParts.push(msg);

      const jsonContextString = JSON.stringify(jsonContext);
      if (jsonContextString && jsonContextString !== "{}") {
        messageParts.push(jsonContextString);
      }
      return messageParts.join(" ");
    };

    this.writeLogMsgToTerminal = function (msg) {
      console.log(msg);
    };

    this.trace = function (msg, jsonContext = {}) {
      if (TsGistPile.LOG_TRACE) {
        const completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
      }
    };

    this.debug = function (msg, jsonContext = {}) {
      if (TsGistPile.LOG_DEBUG) {
        const completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
      }
    };

    this.info = function (msg, jsonContext = {}) {
      if (TsGistPile.LOG_INFO) {
        const completeMsg = this.buildLogMsg("[ INFO]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
      }
    };

    this.warn = function (msg, jsonContext = {}) {
      const completeMsg = this.buildLogMsg("[ WARN]", msg, jsonContext);
      this.writeLogMsgToTerminal(completeMsg);
    };

    this.error = function (msg, jsonContext = {}) {
      const completeMsg = this.buildLogMsg("[ ERROR]", msg, jsonContext);
      this.writeLogMsgToTerminal(completeMsg);
    };
  }

  TsGistPile.d4l = function (input) {
    if (typeof input === 'undefined') {
      return "<undefined> (undefined)";
    } else if (input == null) {
      return "<null> (null)";
    } else if (typeof input === 'string') {
      return `'${input}' (string, ${input.length})`;
    } else if (typeof input === 'number') {
      return `${input} (number)`;
    } else if (typeof input === 'boolean') {
      return `${input ? 'TRUE' : 'FALSE'} (boolean)`;
    } else if (input instanceof Error) {
      return `${input} (Error)`;
    } else if (Object.prototype.toString.call(input) === '[object Date]') {
      return input.toISOString();
    } else if (typeof input === 'object') {
      try {
        return JSON.stringify(input);
      } catch (err) {
        return "<unserializable object>";
      }
    } else if (Array.isArray(input)) {
      return `Array(len=${input.length})`;
    }
    return `${input}`;
  };

  // Expose the namespace to the global object (window in browsers)
  global.TsGistPile = TsGistPile;
})(this);
