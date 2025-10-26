"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_RULES = void 0;
exports.getLogger = getLogger;
exports.withStoreId = withStoreId;
exports.resetLogLevelRulesCache = resetLogLevelRulesCache;
var envUtil_1 = require("../env/envUtil");
var statUtil_1 = require("../stat/statUtil");
var api_1 = require("@opentelemetry/api");
var piiSanitizer_1 = require("./piiSanitizer");
var AsyncLocalStorage;
if (typeof window === "undefined" && typeof global !== "undefined") {
    var ALS = require("async_hooks").AsyncLocalStorage;
    AsyncLocalStorage = ALS;
}
var asyncLocalStorage;
if (AsyncLocalStorage != null) {
    asyncLocalStorage = new AsyncLocalStorage();
}
var LoggerFactory = (function () {
    function LoggerFactory() {
    }
    LoggerFactory.getLogger = function (loggerName) {
        if (LoggerFactory.mapOfLoggers == null) {
            LoggerFactory.mapOfLoggers = new Map();
        }
        var logger = this.mapOfLoggers.get(loggerName);
        if (logger == null) {
            logger = new Logger(loggerName);
            LoggerFactory.mapOfLoggers.set(loggerName, logger);
        }
        return logger;
    };
    LoggerFactory.resetLoggerCache = function () {
        LoggerFactory.mapOfLoggers = new Map();
    };
    return LoggerFactory;
}());
var Logger = (function () {
    function Logger(loggerName) {
        this.loggerName = loggerName;
    }
    Logger.prototype.buildLogMsg = function (severity, msg, jsonContext) {
        if (isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_USE_JSON_FORMAT'))) {
            return this.buildLogMsgJsonFormat(severity, msg, jsonContext);
        }
        else {
            return this.buildLogMsgPlainText(severity, msg, jsonContext);
        }
    };
    Logger.prototype.buildLogMsgJsonFormat = function (severity, msg, jsonContext) {
        var json = {};
        if (typeof process !== 'undefined' && isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_PREPEND_TIMESTAMP'))) {
            json["at"] = new Date().toISOString();
        }
        severity = severity.replace(/[\[\]]/g, "").trim();
        json["lvl"] = severity;
        json["logger"] = this.loggerName;
        if (typeof msg === 'function') {
            json["msg"] = msg();
        }
        else {
            json["msg"] = msg;
        }
        jsonContext = this.buildCompleteJsonContext(jsonContext);
        var mergedJson = __assign(__assign({}, jsonContext), json);
        return JSON.stringify(mergedJson);
    };
    Logger.prototype.buildCompleteJsonContext = function (jsonContext) {
        if (asyncLocalStorage != null) {
            try {
                var storeInLocalStorage = asyncLocalStorage.getStore();
                if (storeInLocalStorage != null && typeof storeInLocalStorage === 'object') {
                    var storeId = storeInLocalStorage.storeId;
                    if (storeId != null) {
                        jsonContext = Object.assign({}, jsonContext, { storeId: storeId });
                    }
                }
            }
            catch (err) {
            }
        }
        var span = api_1.trace.getSpan(api_1.context.active());
        if (span) {
            var _a = span.spanContext(), traceId = _a.traceId, spanId = _a.spanId;
            jsonContext = Object.assign({}, jsonContext, { trace_id: traceId, span_id: spanId });
        }
        else {
        }
        jsonContext = (0, piiSanitizer_1.sanitizePII)(jsonContext);
        return jsonContext;
    };
    Logger.prototype.buildLogMsgPlainText = function (severity, msg, jsonContext) {
        var messageParts = [];
        if (typeof process !== 'undefined' && isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_PREPEND_TIMESTAMP'))) {
            messageParts.push(new Date().toUTCString());
        }
        messageParts.push(severity);
        messageParts.push(this.loggerName);
        if (typeof msg === 'function') {
            messageParts.push(msg());
        }
        else {
            messageParts.push(msg);
        }
        jsonContext = this.buildCompleteJsonContext(jsonContext);
        var wouldBeJsonContextString = JSON.stringify(jsonContext);
        if (wouldBeJsonContextString != null && wouldBeJsonContextString.length > 0 && wouldBeJsonContextString != "{}" && wouldBeJsonContextString != "{ }") {
            messageParts.push(wouldBeJsonContextString);
        }
        return messageParts.join(" ");
    };
    Logger.prototype.writeLogMsgToTerminal = function (msg) {
        var extra = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extra[_i - 1] = arguments[_i];
        }
        if (typeof process !== 'undefined' && isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_TO_STDERR'))) {
            if (extra.length === 0) {
                console.error(msg);
            }
            else if (extra.length > 0) {
                console.error(msg, extra);
            }
        }
        else {
            if (extra.length === 0) {
                console.log(msg);
            }
            else if (extra.length > 0) {
                console.log(msg, extra);
            }
        }
    };
    Logger.prototype.trace = function (msg, jsonContext) {
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (isLogLevelEnabled(this.loggerName, 'TRACE')) {
            var completeMsg = this.buildLogMsg("[ TRACE]", msg, jsonContext);
            this.writeLogMsgToTerminal(completeMsg);
        }
    };
    Logger.prototype.debug = function (msg, jsonContext) {
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (isLogLevelEnabled(this.loggerName, 'DEBUG')) {
            var completeMsg = this.buildLogMsg("[ DEBUG]", msg, jsonContext);
            this.writeLogMsgToTerminal(completeMsg);
        }
    };
    Logger.prototype.info = function (msg, jsonContext) {
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (isLogLevelEnabled(this.loggerName, 'INFO')) {
            var completeMsg = this.buildLogMsg("[  INFO]", msg, jsonContext);
            this.writeLogMsgToTerminal(completeMsg);
        }
    };
    Logger.prototype.notice = function (msg, jsonContext) {
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        var completeMsg = this.buildLogMsg("[NOTICE]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
    };
    Logger.prototype.fatal = function (msg, jsonContext) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.STATHAT_EZ_KEY) != null && ((_c = (_b = process.env) === null || _b === void 0 ? void 0 : _b.STATHAT_EZ_KEY.trim()) === null || _c === void 0 ? void 0 : _c.length) > 0 && ((_d = process.env) === null || _d === void 0 ? void 0 : _d.STATHAT_FATAL_KEY) != null && ((_f = (_e = process.env) === null || _e === void 0 ? void 0 : _e.STATHAT_FATAL_KEY.trim()) === null || _f === void 0 ? void 0 : _f.length) > 0) {
            var controller_1 = new AbortController();
            var timeoutId_1 = setTimeout(function () { return controller_1.abort(); }, 750);
            var url = "https://api.stathat.com/ez";
            var ezKeyLabel = "ezkey";
            var requestBody = "stat=".concat((_g = process.env.STATHAT_FATAL_KEY) === null || _g === void 0 ? void 0 : _g.trim(), "&").concat(ezKeyLabel, "=").concat((_h = process.env.STATHAT_EZ_KEY) === null || _h === void 0 ? void 0 : _h.trim(), "&count=1");
            var beforeAt_1 = new Date();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                signal: controller_1.signal,
                body: requestBody
            }).then(function (response) {
                var deltaInMs = new Date().getTime() - beforeAt_1.getTime();
                clearTimeout(timeoutId_1);
            }).catch(function (err) {
            });
        }
        if (typeof process !== 'undefined' && ((_j = process.env) === null || _j === void 0 ? void 0 : _j.KPITRACKS_FATAL_KEY) != null && ((_m = (_l = (_k = process.env) === null || _k === void 0 ? void 0 : _k.KPITRACKS_FATAL_KEY) === null || _l === void 0 ? void 0 : _l.trim()) === null || _m === void 0 ? void 0 : _m.length) > 0) {
            (0, statUtil_1.sendStatToKpitracks)("stat=".concat((_o = process.env.KPITRACKS_FATAL_KEY) === null || _o === void 0 ? void 0 : _o.trim(), "&count=1"));
        }
        var completeMsg = this.buildLogMsg("[ FATAL][ ERROR]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
    };
    Logger.prototype.warn = function (msg, jsonContext) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.STATHAT_EZ_KEY) != null && ((_d = (_c = (_b = process.env) === null || _b === void 0 ? void 0 : _b.STATHAT_EZ_KEY) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.length) > 0 && ((_e = process.env) === null || _e === void 0 ? void 0 : _e.STATHAT_WARN_KEY) != null && ((_h = (_g = (_f = process.env) === null || _f === void 0 ? void 0 : _f.STATHAT_WARN_KEY) === null || _g === void 0 ? void 0 : _g.trim()) === null || _h === void 0 ? void 0 : _h.length) > 0) {
            var controller_2 = new AbortController();
            var timeoutId_2 = setTimeout(function () { return controller_2.abort(); }, 750);
            var url = "https://api.stathat.com/ez";
            var ezKeyLabel = "ezkey";
            var requestBody = "stat=".concat((_j = process.env.STATHAT_WARN_KEY) === null || _j === void 0 ? void 0 : _j.trim(), "&").concat(ezKeyLabel, "=").concat((_k = process.env.STATHAT_EZ_KEY) === null || _k === void 0 ? void 0 : _k.trim(), "&count=1");
            var beforeAt_2 = new Date();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                signal: controller_2.signal,
                body: requestBody
            }).then(function (response) {
                var deltaInMs = new Date().getTime() - beforeAt_2.getTime();
                clearTimeout(timeoutId_2);
            }).catch(function (err) {
            });
        }
        if (typeof process !== 'undefined' && ((_l = process.env) === null || _l === void 0 ? void 0 : _l.KPITRACKS_WARN_KEY) != null && ((_p = (_o = (_m = process.env) === null || _m === void 0 ? void 0 : _m.KPITRACKS_WARN_KEY) === null || _o === void 0 ? void 0 : _o.trim()) === null || _p === void 0 ? void 0 : _p.length) > 0) {
            (0, statUtil_1.sendStatToKpitracks)("stat=".concat((_q = process.env.KPITRACKS_WARN_KEY) === null || _q === void 0 ? void 0 : _q.trim(), "&count=1"));
        }
        var completeMsg = this.buildLogMsg("[  WARN]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
    };
    Logger.prototype.error = function (msg, jsonContext) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (jsonContext === void 0) { jsonContext = {}; }
        var extra = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            extra[_i - 2] = arguments[_i];
        }
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.STATHAT_EZ_KEY) != null && ((_d = (_c = (_b = process.env) === null || _b === void 0 ? void 0 : _b.STATHAT_EZ_KEY) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.length) > 0 && ((_e = process.env) === null || _e === void 0 ? void 0 : _e.STATHAT_ERROR_KEY) != null && ((_h = (_g = (_f = process.env) === null || _f === void 0 ? void 0 : _f.STATHAT_ERROR_KEY) === null || _g === void 0 ? void 0 : _g.trim()) === null || _h === void 0 ? void 0 : _h.length) > 0) {
            var controller_3 = new AbortController();
            var timeoutId_3 = setTimeout(function () { return controller_3.abort(); }, 750);
            var url = "https://api.stathat.com/ez";
            var ezKeyLabel = "ezkey";
            var requestBody = "stat=".concat((_j = process.env.STATHAT_ERROR_KEY) === null || _j === void 0 ? void 0 : _j.trim(), "&").concat(ezKeyLabel, "=").concat((_k = process.env.STATHAT_EZ_KEY) === null || _k === void 0 ? void 0 : _k.trim(), "&count=1");
            var beforeAt_3 = new Date();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                signal: controller_3.signal,
                body: requestBody
            }).then(function (response) {
                var deltaInMs = new Date().getTime() - beforeAt_3.getTime();
                clearTimeout(timeoutId_3);
            }).catch(function (err) {
            });
        }
        if (typeof process !== 'undefined' && ((_l = process.env) === null || _l === void 0 ? void 0 : _l.KPITRACKS_ERROR_KEY) != null && ((_p = (_o = (_m = process.env) === null || _m === void 0 ? void 0 : _m.KPITRACKS_ERROR_KEY) === null || _o === void 0 ? void 0 : _o.trim()) === null || _p === void 0 ? void 0 : _p.length) > 0) {
            (0, statUtil_1.sendStatToKpitracks)("stat=".concat((_q = process.env.KPITRACKS_ERROR_KEY) === null || _q === void 0 ? void 0 : _q.trim(), "&count=1"));
        }
        var completeMsg = this.buildLogMsg("[ ERROR]", msg, jsonContext);
        this.writeLogMsgToTerminal(completeMsg);
    };
    return Logger;
}());
function getLogger(loggerName) {
    return LoggerFactory.getLogger(loggerName);
}
function withStoreId(storeId, fn) {
    if (typeof asyncLocalStorage != 'undefined' && asyncLocalStorage != null) {
        var storeInLocalStorage = asyncLocalStorage.getStore();
        if (storeInLocalStorage == null) {
            storeInLocalStorage = {};
        }
        storeInLocalStorage.storeId = storeId;
        return asyncLocalStorage.run(storeInLocalStorage, fn);
    }
    else {
        return fn();
    }
}
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
exports.LOG_RULES = {
    levels: []
};
function matchesPattern(loggerName, pattern) {
    if (pattern === loggerName) {
        return true;
    }
    if (!pattern.includes('*')) {
        return false;
    }
    var regexPattern = pattern
        .split('*')
        .map(function (part) { return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); })
        .join('.*');
    var regex = new RegExp("^".concat(regexPattern, "$"));
    return regex.test(loggerName);
}
function parseLogLevelRules() {
    return exports.LOG_RULES.levels;
}
function findMatchingLogLevel(loggerName, rules) {
    if (rules.length === 0) {
        return null;
    }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        if (matchesPattern(loggerName, rule.pattern)) {
            return rule.level;
        }
    }
    return null;
}
var cachedLogLevelRules = null;
function getLogLevelRules() {
    if (cachedLogLevelRules === null) {
        cachedLogLevelRules = parseLogLevelRules();
    }
    return cachedLogLevelRules;
}
function resetLogLevelRulesCache() {
    cachedLogLevelRules = null;
    LoggerFactory.resetLoggerCache();
}
function isLogLevelEnabled(loggerName, level) {
    var rules = getLogLevelRules();
    var configuredLevel = findMatchingLogLevel(loggerName, rules);
    if (configuredLevel !== null) {
        var levelHierarchy = ['TRACE', 'DEBUG', 'INFO', 'NOTICE', 'WARN', 'ERROR', 'FATAL'];
        var configuredIndex = levelHierarchy.indexOf(configuredLevel);
        var requestedIndex = levelHierarchy.indexOf(level);
        return requestedIndex >= configuredIndex;
    }
    if (typeof process === 'undefined') {
        return ['NOTICE', 'WARN', 'ERROR', 'FATAL'].includes(level);
    }
    switch (level) {
        case 'TRACE':
            return isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_TRACE'));
        case 'DEBUG':
            return isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_DEBUG'));
        case 'INFO':
            return isTruelike((0, envUtil_1.tryGetEnvVar)('LOG_INFO'));
        case 'NOTICE':
        case 'WARN':
        case 'ERROR':
        case 'FATAL':
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=getLogger.js.map