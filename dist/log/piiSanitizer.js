"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPIISecureModeEnabled = isPIISecureModeEnabled;
exports.hashPIIValue = hashPIIValue;
exports.sanitizePII = sanitizePII;
exports.getPIIFieldNames = getPIIFieldNames;
var envUtil_1 = require("../env/envUtil");
var nodeCrypto;
if (typeof window === "undefined" && typeof global !== "undefined") {
    try {
        nodeCrypto = require("crypto");
    }
    catch (err) {
    }
}
var PII_FIELDS = [
    'userId', 'user_id', 'principalId', 'principal_id', 'email', 'emailSanitized',
    'email_sanitized', 'username', 'user_name', 'uid', 'login', 'name',
    'fullname', 'fullName', 'full_name',
    'phone', 'phoneNumber', 'phone_number', 'ssn', 'dob', 'dateOfBirth',
    'firstName', 'first_name', 'lastName', 'last_name', 'fullName', 'full_name',
    'address', 'street', 'city', 'zip', 'zipCode', 'postal', 'ip', 'ipAddress',
    'ip_address', 'creditCard', 'credit_card', 'ccNumber', 'passport', 'license',
    'driversLicense', 'socialSecurity'
];
function isPIISecureModeEnabled() {
    if (typeof window !== "undefined") {
        return false;
    }
    var secret = (0, envUtil_1.tryGetEnvVar)('LOG_HASH_SECRET');
    return secret != null && secret.trim().length > 0 && nodeCrypto != null;
}
function hashPII(value) {
    if (value == null)
        return 'null';
    if (!nodeCrypto) {
        return '****';
    }
    var secret = (0, envUtil_1.tryGetEnvVar)('LOG_HASH_SECRET') || '';
    try {
        return nodeCrypto
            .createHash('sha256')
            .update(value + secret)
            .digest('hex')
            .substring(0, 12);
    }
    catch (err) {
        return '****';
    }
}
function hashPIIValue(value) {
    return hashPII(value);
}
function sanitizePII(obj) {
    if (!isPIISecureModeEnabled()) {
        return obj;
    }
    if (obj == null)
        return obj;
    if (typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return sanitizePII(item); });
    }
    var sanitized = {};
    var _loop_1 = function (key, value) {
        var lowerKey = key.toLowerCase();
        var keyWithoutUnderscore = lowerKey.startsWith('_') ? lowerKey.substring(1) : lowerKey;
        var isPIIField = PII_FIELDS.some(function (piiField) {
            var lowerPIIField = piiField.toLowerCase();
            return (lowerKey === lowerPIIField ||
                keyWithoutUnderscore === lowerPIIField ||
                lowerKey.includes(lowerPIIField) ||
                keyWithoutUnderscore.includes(lowerPIIField));
        });
        if (isPIIField) {
            var hashedKey = "".concat(key, "_hash");
            sanitized[hashedKey] = hashPII(value != null ? String(value) : value);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizePII(value);
        }
        else {
            sanitized[key] = value;
        }
    };
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        _loop_1(key, value);
    }
    return sanitized;
}
function getPIIFieldNames() {
    return __spreadArray([], PII_FIELDS, true);
}
//# sourceMappingURL=piiSanitizer.js.map