"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s4l = exports.c4l = exports.b4l = exports.p4l = exports.blurIfEnabled = exports.blur = exports.plain = void 0;
exports.d4l = d4l;
exports.d4lObfuscate = d4lObfuscate;
exports.d4lPii = d4lPii;
exports.blurWhereNeeded = blurWhereNeeded;
var piiSanitizer_1 = require("./piiSanitizer");
var environmentUtil_1 = require("../env/environmentUtil");
var smartObfuscate_1 = require("./smartObfuscate");
function d4l(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    if (typeof input === 'undefined') {
        return "<undefined> (undefined)";
    }
    else if (input == null) {
        return "<null> (null)";
    }
    else if (typeof input === 'string') {
        if (logOptions.obfuscate) {
            return (0, smartObfuscate_1.smartObfuscate)(input);
        }
        if (logOptions.joinLines) {
            input = input === null || input === void 0 ? void 0 : input.replace(/\r\n/g, " ");
            input = input === null || input === void 0 ? void 0 : input.replace(/\n\r/g, " ");
            input = input === null || input === void 0 ? void 0 : input.replace(/\n/g, " ");
            input = input === null || input === void 0 ? void 0 : input.replace(/\r/g, " ");
        }
        return "'".concat(input, "' (string, ").concat(input.length, ")");
    }
    else if (typeof input === 'number') {
        return "".concat(input, " (number)");
    }
    else if (typeof input === 'boolean') {
        return "".concat(input == true ? 'TRUE' : 'FALSE', " (boolean)");
    }
    else if (input instanceof Error) {
        var stackStr = input.stack;
        stackStr = stackStr === null || stackStr === void 0 ? void 0 : stackStr.replace(/\r\n/g, "\\n,   ");
        stackStr = stackStr === null || stackStr === void 0 ? void 0 : stackStr.replace(/\n\r/g, "\\n,   ");
        stackStr = stackStr === null || stackStr === void 0 ? void 0 : stackStr.replace(/\n/g, "\\n,   ");
        stackStr = stackStr === null || stackStr === void 0 ? void 0 : stackStr.replace(/\r/g, "\\n,   ");
        return "".concat(input, " (Error, stack: ").concat(stackStr);
    }
    else if (Array.isArray(input)) {
        var parts = [];
        var inputAsArray = input;
        if (inputAsArray.length > 0) {
            parts.push("".concat(d4l(inputAsArray[0])));
        }
        if (inputAsArray.length > 2) {
            parts.push("\u2026");
        }
        if (inputAsArray.length > 1) {
            parts.push("".concat(d4l(inputAsArray[inputAsArray.length - 1])));
        }
        return "Array(len=".concat(inputAsArray.length, ") [").concat(parts.join(", "), "]");
    }
    else if (Object.prototype.toString.call(input) === '[object Date]') {
        return input.toISOString();
    }
    else if (input instanceof RegExp) {
        return input.toString() + " (RegExp)";
    }
    else if (typeof input === 'object') {
        var objectToLog = input;
        if ((0, environmentUtil_1.isEagerAutoSanitizeEnabled)()) {
            objectToLog = (0, piiSanitizer_1.eagerSanitizePII)(input);
        }
        if (typeof (objectToLog.toDebugString) === 'function') {
            return objectToLog.toDebugString() + " (object; via toDebugString())";
        }
        if (typeof (objectToLog.toLogString) === 'function') {
            return objectToLog.toLogString() + " (object; via toLogString())";
        }
        if (typeof (objectToLog.asJson) === 'function') {
            var whateverAsJsonReturns = objectToLog.asJson();
            try {
                return localSafeStringify(whateverAsJsonReturns) || "".concat(objectToLog);
            }
            catch (err) { }
        }
        try {
            return localSafeStringify(objectToLog) + " (object)";
        }
        catch (err) { }
    }
    return "".concat(input);
}
function d4lObfuscate(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    if (input instanceof Error || input instanceof Date || input instanceof RegExp) {
        return d4l(input, logOptions);
    }
    if (typeof input === 'object' && input !== null) {
        var sanitized = (0, piiSanitizer_1.eagerSanitizePII)(input);
        return d4l(sanitized, logOptions);
    }
    if (typeof input === 'string') {
        var obfuscated = (0, smartObfuscate_1.smartObfuscate)(input);
        if ((0, piiSanitizer_1.isPIISecureModeEnabled)() && input.length > 10) {
            var hash = (0, piiSanitizer_1.hashPIIValue)(input);
            return "".concat(obfuscated, " (hashed=").concat(hash, ")");
        }
        return obfuscated;
    }
    return d4l(input, logOptions);
}
function d4lPii(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    if (!(0, piiSanitizer_1.isPIISecureModeEnabled)()) {
        return d4l(input, logOptions);
    }
    if (typeof input === 'string') {
        return d4lObfuscate(input, logOptions);
    }
    return d4l(input, logOptions);
}
function scanObjectForPII(obj) {
    if (obj == null)
        return obj;
    if (typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(function (item) {
            if (typeof item === 'string') {
                return scanStringForPII(item);
            }
            else if (typeof item === 'object') {
                return scanObjectForPII(item);
            }
            return item;
        });
    }
    var scanned = {};
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === 'string') {
            scanned[key] = scanStringForPII(value);
        }
        else if (typeof value === 'object' && value !== null) {
            scanned[key] = scanObjectForPII(value);
        }
        else {
            scanned[key] = value;
        }
    }
    return scanned;
}
function scanStringForPII(input) {
    var result = input;
    result = result.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{3,4}\b/g, function (match) {
        var digits = match.replace(/\D/g, '');
        if (digits.length >= 15 && digits.length <= 16) {
            return '****' + match.slice(-4);
        }
        return match;
    });
    result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, function (match) {
        return '****' + match.slice(-4);
    });
    result = result.replace(/\b[\+]?[\d\s\-\(\)]{10,}\b/g, function (match) {
        var digits = match.replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 15) {
            return '****' + match.slice(-4);
        }
        return match;
    });
    result = result.replace(/\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g, function (match) {
        var parts = match.split('@');
        var local = parts[0];
        var domain = parts[1];
        if (local.length <= 2) {
            return "****@".concat(domain);
        }
        return "".concat(local.substring(0, 2), "****@").concat(domain);
    });
    result = result.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, function (match) {
        var parts = match.split('.');
        if (parts.every(function (p) { return parseInt(p) <= 255; })) {
            return "****".concat(match.slice(-4));
        }
        return match;
    });
    result = result.replace(/\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/g, function (match, first, last) {
        return "".concat(first.substring(0, 2), "**** ").concat(last.substring(0, 2), "****");
    });
    return result;
}
function blurWhereNeeded(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    if (typeof input === 'object' && input !== null) {
        var scanned = scanObjectForPII(input);
        return d4l(scanned, logOptions);
    }
    if (typeof input !== 'string') {
        return d4l(input, logOptions);
    }
    return scanStringForPII(input);
}
exports.plain = d4l;
exports.blur = d4lObfuscate;
exports.blurIfEnabled = d4lPii;
exports.p4l = d4l;
exports.b4l = d4lObfuscate;
exports.c4l = d4lPii;
exports.s4l = blurWhereNeeded;
var localSafeStringify = function (obj, indent) {
    if (indent === void 0) { indent = 0; }
    var cache = [];
    try {
        var retval = JSON.stringify(obj, function (key, value) {
            if (value instanceof RegExp) {
                return value.toString();
            }
            return typeof value === 'object' && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value;
        }, indent);
        cache = null;
        return retval;
    }
    catch (err) {
        cache = null;
        return undefined;
    }
};
//# sourceMappingURL=logUtil.js.map