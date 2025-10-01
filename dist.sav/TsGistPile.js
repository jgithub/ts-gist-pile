(function (global) {
  const TsGistPile = {};

  TsGistPile.VERSION = "0.0.229";
  TsGistPile.LOG_TRACE = false;
  TsGistPile.LOG_DEBUG = false;
  TsGistPile.LOG_INFO = false;

  // Object utilities
  TsGistPile.objectUtil = (function () {
    function isPresent(input) {
      return input !== null && input !== undefined;
    }

    return {
      isPresent: isPresent,
      exists: isPresent
    };
  })();

  // String utilities
  TsGistPile.stringUtil = (function () {
    function isPresent(input) {
      return input !== null && input !== undefined && input.toString().trim().length > 0;
    }

    function isEmpty(input) {
      return input === null || input === undefined || input.toString().length === 0;
    }

    function isBlank(input) {
      return input === null || input === undefined || input.toString().trim().length === 0;
    }

    function isWellFormedCanonicalUuid(input) {
      if (!input) return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(input);
    }

    function padLeftWithZeros(input, notLessThanXDigits) {
      const str = input.toString();
      return str.padStart(notLessThanXDigits, '0');
    }

    function tryRemoveTrailingSlashesIfPresent(input) {
      if (!input) return input;
      return input.replace(/\/+$/, '');
    }

    function tryRemoveDoubleSlashesIfPresent(input, opt) {
      if (!input) return input;
      const options = opt || { butTryToBeSmartAboutUrls: true };
      if (options.butTryToBeSmartAboutUrls) {
        return input.replace(/([^:]\/)\/+/g, '$1');
      } else {
        return input.replace(/\/+/g, '/');
      }
    }

    return {
      isPresent: isPresent,
      isEmpty: isEmpty,
      isBlank: isBlank,
      isWellFormedCanonicalUuid: isWellFormedCanonicalUuid,
      padLeftWithZeros: padLeftWithZeros,
      tryRemoveTrailingSlashesIfPresent: tryRemoveTrailingSlashesIfPresent,
      tryRemoveDoubleSlashesIfPresent: tryRemoveDoubleSlashesIfPresent
    };
  })();

  // Array utilities
  TsGistPile.arrayUtil = (function () {
    function tryParseStringToArray(input) {
      if (!input) return [];
      const delimiters = [',', ';', '|', '\n', '\r\n'];
      for (let delimiter of delimiters) {
        if (input.includes(delimiter)) {
          return input.split(delimiter).map(item => item.trim()).filter(item => item.length > 0);
        }
      }
      return [input.trim()];
    }

    function hasExactlyOneItem(input) {
      return Array.isArray(input) && input.length === 1;
    }

    function isPopulated(input) {
      return Array.isArray(input) && input.length > 0;
    }

    function existsButIsEmpty(input) {
      return Array.isArray(input) && input.length === 0;
    }

    return {
      tryParseStringToArray: tryParseStringToArray,
      hasExactlyOneItem: hasExactlyOneItem,
      isPopulated: isPopulated,
      existsButIsEmpty: existsButIsEmpty
    };
  })();

  // Number utilities
  TsGistPile.numberUtil = (function () {
    function tryAsNumber(input) {
      if (input === null || input === undefined) return input;
      if (typeof input === 'number') return input;
      if (typeof input === 'string') {
        const trimmed = input.trim();
        if (trimmed === '') return undefined;
        const num = Number(trimmed);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    }

    function ensureNumber(input) {
      const result = tryAsNumber(input);
      if (result === undefined || result === null) {
        throw new Error('Unable to convert to number: ' + input);
      }
      return result;
    }

    return {
      tryAsNumber: tryAsNumber,
      ensureNumber: ensureNumber
    };
  })();

  // Date utilities
  TsGistPile.dateUtil = (function () {
    function generateSortedFiveMinuteBucketsForYearInSeconds(year) {
      const buckets = [];
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      
      for (let time = start.getTime(); time < end.getTime(); time += 5 * 60 * 1000) {
        buckets.push(Math.floor(time / 1000));
      }
      
      return buckets;
    }

    function dateToYyyyMmDdStringAtUtc(date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    function getDateInLondon(date) {
      return new Date(date.toLocaleString("en-US", { timeZone: "Europe/London" }));
    }

    function getMillisecondsBetweenDates(start, end) {
      return end.getTime() - start.getTime();
    }

    function getSecondsBetweenDates(start, end) {
      return Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    function getSecondsBetweenEpochAndDate(date) {
      return Math.floor(date.getTime() / 1000);
    }

    function getMillisecondsBetweenEpochAndDate(date) {
      return date.getTime();
    }

    function isValidDateObject(obj) {
      return obj instanceof Date && !isNaN(obj.getTime());
    }

    function isIso8601(input) {
      if (!input) return false;
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return iso8601Regex.test(input);
    }

    function isIso8601Utc(input) {
      if (!input) return false;
      const iso8601UtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      return iso8601UtcRegex.test(input);
    }

    return {
      generateSortedFiveMinuteBucketsForYearInSeconds: generateSortedFiveMinuteBucketsForYearInSeconds,
      dateToYyyyMmDdStringAtUtc: dateToYyyyMmDdStringAtUtc,
      getDateInLondon: getDateInLondon,
      getMillisecondsBetweenDates: getMillisecondsBetweenDates,
      getSecondsBetweenDates: getSecondsBetweenDates,
      getSecondsBetweenEpochAndDate: getSecondsBetweenEpochAndDate,
      getMillisecondsBetweenEpochAndDate: getMillisecondsBetweenEpochAndDate,
      isValidDateObject: isValidDateObject,
      isIso8601: isIso8601,
      isIso8601Utc: isIso8601Utc
    };
  })();

  // Map utilities
  TsGistPile.mapUtil = (function () {
    function getKeys(myMap) {
      return Array.from(myMap.keys());
    }

    return {
      getKeys: getKeys
    };
  })();

  // Function utilities
  TsGistPile.functionUtil = (function () {
    function tryFn(fn) {
      try {
        return fn();
      } catch (error) {
        return undefined;
      }
    }

    return {
      tryFn: tryFn
    };
  })();

  // Clone utilities (simplified without lodash)
  TsGistPile.cloneUtil = (function () {
    function cloneDeep(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (Array.isArray(obj)) return obj.map(cloneDeep);
      
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = cloneDeep(obj[key]);
        }
      }
      return cloned;
    }

    function cloneWithOverrides(original, overrides) {
      const cloned = cloneDeep(original);
      return Object.assign(cloned, overrides);
    }

    return {
      cloneDeep: cloneDeep,
      cloneWithOverrides: cloneWithOverrides
    };
  })();

  // Boolean utilities
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

  // JSON utilities
  TsGistPile.jsonUtil = (function () {
    function recursivelyFilterPropertiesInPlace(obj, listOfPropertyNamesToRemove) {
      if (obj === null || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(item => recursivelyFilterPropertiesInPlace(item, listOfPropertyNamesToRemove));
      } else {
        listOfPropertyNamesToRemove.forEach(prop => {
          delete obj[prop];
        });
        
        Object.keys(obj).forEach(key => {
          recursivelyFilterPropertiesInPlace(obj[key], listOfPropertyNamesToRemove);
        });
      }
    }

    function recursivelyFilterPropertiesCopy(obj, listOfPropertyNamesToRemove) {
      const copy = TsGistPile.cloneUtil.cloneDeep(obj);
      recursivelyFilterPropertiesInPlace(copy, listOfPropertyNamesToRemove);
      return copy;
    }

    return {
      recursivelyFilterPropertiesInPlace: recursivelyFilterPropertiesInPlace,
      recursivelyFilterPropertiesCopy: recursivelyFilterPropertiesCopy
    };
  })();

  // Try utilities
  TsGistPile.tryUtil = (function () {
    function tryCatchTuplify(fn) {
      try {
        const result = fn();
        return [result, null];
      } catch (error) {
        return [null, error];
      }
    }

    function tryCatchTuplifyAsync(promise) {
      return promise
        .then(result => [result, null])
        .catch(error => [null, error]);
    }

    return {
      tryCatchTuplify: tryCatchTuplify,
      tryCatchTuplifyAsync: tryCatchTuplifyAsync
    };
  })();

  // Radix utilities
  TsGistPile.radixUtil = (function () {
    const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const NANOID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

    function encodeNumberAsBase62(num) {
      if (num === 0) return '0';
      let result = '';
      while (num > 0) {
        result = BASE62_ALPHABET[num % 62] + result;
        num = Math.floor(num / 62);
      }
      return result;
    }

    function decodeBase62ToNumber(str) {
      let result = 0;
      for (let i = 0; i < str.length; i++) {
        result = result * 62 + BASE62_ALPHABET.indexOf(str[i]);
      }
      return result;
    }

    function convertHexToBase62(hex) {
      const num = parseInt(hex, 16);
      return encodeNumberAsBase62(num);
    }

    function convertHexToNanoIdAlphabet(hex) {
      const num = parseInt(hex, 16);
      let result = '';
      let remaining = num;
      while (remaining > 0) {
        result = NANOID_ALPHABET[remaining % 64] + result;
        remaining = Math.floor(remaining / 64);
      }
      return result || '0';
    }

    return {
      encodeNumberAsBase62: encodeNumberAsBase62,
      decodeBase62ToNumber: decodeBase62ToNumber,
      convertHexToBase62: convertHexToBase62,
      convertHexToNanoIdAlphabet: convertHexToNanoIdAlphabet
    };
  })();

  // Safe stringify utility
  TsGistPile.safeStringify = function (obj, replacer, space) {
    try {
      const cache = new Set();
      return JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return replacer ? replacer(key, value) : value;
      }, space);
    } catch (error) {
      return '[Unstringifiable]';
    }
  };

  // Enhanced d4l function
  TsGistPile.d4l = function (input, logOptions) {
    const options = logOptions || {};
    
    if (typeof input === 'undefined') {
      return "<undefined> (undefined)";
    } else if (input == null) {
      return "<null> (null)";
    } else if (typeof input === 'string') {
      return options.obfuscate ? `'[OBFUSCATED]' (string, ${input.length})` : `'${input}' (string, ${input.length})`;
    } else if (typeof input === 'number') {
      return `${input} (number)`;
    } else if (typeof input === 'boolean') {
      return `${input ? 'TRUE' : 'FALSE'} (boolean)`;
    } else if (input instanceof Error) {
      return `${input.name}: ${input.message} (Error)`;
    } else if (Object.prototype.toString.call(input) === '[object Date]') {
      return input.toISOString();
    } else if (Array.isArray(input)) {
      const preview = input.slice(0, 3).map(item => TsGistPile.d4l(item, options));
      const suffix = input.length > 3 ? '...' : '';
      const content = preview.join(', ') + suffix;
      return options.joinLines ? `[${content}] (Array, len=${input.length})` : `Array(len=${input.length}): [${content}]`;
    } else if (typeof input === 'object') {
      try {
        const stringified = options.obfuscate ? '[OBFUSCATED]' : TsGistPile.safeStringify(input, null, options.joinLines ? 0 : 2);
        return stringified;
      } catch (err) {
        return "<unserializable object>";
      }
    }
    return `${input}`;
  };

  TsGistPile.d4lObfuscate = function (input, logOptions) {
    const options = Object.assign({}, logOptions, { obfuscate: true });
    return TsGistPile.d4l(input, options);
  };

  // Simple UUID generation (without external library)
  TsGistPile.uuidUtil = (function () {
    function generateV4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Simplified V7 generation (timestamp-based)
    function generateV7() {
      const now = Date.now();
      const timestamp = now.toString(16).padStart(12, '0');
      const randomPart = Math.random().toString(16).substring(2, 14).padStart(12, '0');
      
      return [
        timestamp.substring(0, 8),
        timestamp.substring(8, 12),
        '7' + randomPart.substring(0, 3),
        '8' + randomPart.substring(3, 6),
        randomPart.substring(6, 18)
      ].join('-');
    }

    return {
      generateV4: generateV4,
      generateV7: generateV7
    };
  })();

  // ID utilities
  TsGistPile.idUtil = (function () {
    function generateTimeOrderedBase62Id() {
      const uuid = TsGistPile.uuidUtil.generateV7();
      const hex = uuid.replace(/-/g, '');
      return TsGistPile.radixUtil.convertHexToBase62(hex);
    }

    function generateTimeOrderedNanoLikeId() {
      const uuid = TsGistPile.uuidUtil.generateV7();
      const hex = uuid.replace(/-/g, '');
      return TsGistPile.radixUtil.convertHexToNanoIdAlphabet(hex);
    }

    return {
      generateTimeOrderedBase62Id: generateTimeOrderedBase62Id,
      generateTimeOrderedNanoLikeId: generateTimeOrderedNanoLikeId
    };
  })();

  // Logger Factory and Logger (simplified for browser)
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

      const jsonContextString = TsGistPile.safeStringify(jsonContext);
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

    this.fatal = function (msg, jsonContext = {}) {
      const completeMsg = this.buildLogMsg("[ FATAL]", msg, jsonContext);
      this.writeLogMsgToTerminal(completeMsg);
    };
  }

  // Convenience function for getting logger
  TsGistPile.getLogger = function (loggerName) {
    return TsGistPile.LoggerFactory.getLogger(loggerName);
  };

  // Result utilities
  TsGistPile.ResultTuple = function (data, error) {
    this.data = data;
    this.error = error;
    this.isSuccess = function () {
      return this.error === null || this.error === undefined;
    };
    this.isError = function () {
      return !this.isSuccess();
    };
  };

  TsGistPile.ResultOrErr = function (data, error) {
    this.data = data;
    this.error = error;
    this.isSuccess = function () {
      return this.error === null || this.error === undefined;
    };
    this.isError = function () {
      return !this.isSuccess();
    };
  };

  // Container utilities
  TsGistPile.BooleanStringPair = function (booleanValue, stringValue) {
    this.booleanValue = booleanValue;
    this.stringValue = stringValue;
  };

  TsGistPile.OptionallyCachedValue = function (valueGetter, options) {
    const opts = options || {};
    this.cacheEnabled = opts.cacheEnabled !== false;
    this.valueGetter = valueGetter;
    this.cachedValue = undefined;
    this.isCached = false;

    this.getValue = function () {
      if (this.cacheEnabled && this.isCached) {
        return this.cachedValue;
      }
      
      const value = this.valueGetter();
      if (this.cacheEnabled) {
        this.cachedValue = value;
        this.isCached = true;
      }
      return value;
    };

    this.clearCache = function () {
      this.cachedValue = undefined;
      this.isCached = false;
    };
  };

  // Collection utilities
  TsGistPile.CollectionWithMeta = function (items, meta) {
    this.items = items || [];
    this.meta = meta || {};
  };

  // Expose the namespace to the global object (window in browsers)
  global.TsGistPile = TsGistPile;
})(this);