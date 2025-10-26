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
exports.d4l = d4l;
exports.d4lObfuscate = d4lObfuscate;
exports.d4lPii = d4lPii;
var piiSanitizer_1 = require("./piiSanitizer");
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
            if (input.length > 36) {
                return "****".concat(input.substring(input.length - 4));
            }
            else if (input.length > 26) {
                return "****".concat(input.substring(input.length - 3));
            }
            else if (input.length > 16) {
                return "****".concat(input.substring(input.length - 2));
            }
            else if (input.length > 10) {
                return "****".concat(input.substring(input.length - 1));
            }
            return "****";
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
        if (typeof (input.toDebugString) === 'function') {
            return input.toDebugString() + " (object; via toDebugString())";
        }
        if (typeof (input.toLogString) === 'function') {
            return input.toLogString() + " (object; via toLogString())";
        }
        if (typeof (input.asJson) === 'function') {
            var whateverAsJsonReturns = input.asJson();
            try {
                return localSafeStringify(whateverAsJsonReturns) || "".concat(input);
            }
            catch (err) { }
        }
        try {
            return localSafeStringify(input) + " (object)";
        }
        catch (err) { }
    }
    return "".concat(input);
}
function d4lObfuscate(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    return d4l(input, __assign(__assign({}, logOptions), { obfuscate: true }));
}
function d4lPii(input, logOptions) {
    if (logOptions === void 0) { logOptions = {}; }
    if (!(0, piiSanitizer_1.isPIISecureModeEnabled)()) {
        return d4l(input, logOptions);
    }
    if (input == null) {
        return (0, piiSanitizer_1.hashPIIValue)(input) + " (hashed)";
    }
    var valueToHash;
    if (typeof input === 'string') {
        valueToHash = input;
    }
    else if (typeof input === 'number' || typeof input === 'boolean') {
        valueToHash = String(input);
    }
    else if (input instanceof Error) {
        valueToHash = input.message;
    }
    else if (typeof input === 'object') {
        try {
            valueToHash = JSON.stringify(input);
        }
        catch (err) {
            valueToHash = String(input);
        }
    }
    else {
        valueToHash = String(input);
    }
    return (0, piiSanitizer_1.hashPIIValue)(valueToHash) + " (hashed)";
}
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