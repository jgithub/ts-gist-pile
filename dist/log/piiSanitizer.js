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
exports.eagerSanitizePII = eagerSanitizePII;
var environmentUtil_1 = require("../env/environmentUtil");
var smartObfuscate_1 = require("./smartObfuscate");
var nodeCrypto;
if (typeof window === "undefined" && typeof global !== "undefined") {
    try {
        nodeCrypto = require("crypto");
    }
    catch (err) {
    }
}
var PII_FIELDS = [
    'userId', 'user_id', 'principalId', 'principal_id', 'uid', 'login',
    'username', 'user_name', 'userName',
    'email', 'e_mail', 'e-mail', 'eMail', 'Email',
    'emailAddress', 'email_address', 'emailSanitized', 'email_sanitized',
    'emailNormalized', 'email_normalized',
    'name', 'fullname', 'fullName', 'full_name',
    'firstName', 'first_name', 'lastName', 'last_name',
    'middleName', 'middle_name',
    'phone', 'phoneNumber', 'phone_number', 'telephone', 'mobile', 'cellPhone',
    'ssn', 'socialSecurity', 'social_security',
    'dob', 'dateOfBirth', 'date_of_birth', 'birthdate', 'birth_date',
    'passport', 'passportNumber', 'passport_number',
    'license', 'driversLicense', 'drivers_license', 'driverLicense', 'driver_license',
    'creditCard', 'credit_card', 'creditCardNumber', 'credit_card_number',
    'ccNumber', 'cc_number', 'cardNumber', 'card_number',
    'cvv', 'cvc', 'securityCode', 'security_code',
    'accountNumber', 'account_number', 'bankAccount', 'bank_account',
    'routingNumber', 'routing_number',
    'address', 'street', 'streetAddress', 'street_address',
    'city', 'state', 'province',
    'zip', 'zipCode', 'zip_code', 'postal', 'postalCode', 'postal_code',
    'country',
    'ip', 'ipAddress', 'ip_address', 'ipv4', 'ipv6',
    'lat', 'latitude', 'lon', 'longitude', 'coordinates',
    'password', 'passwd', 'pwd', 'pass',
    'secret', 'apiKey', 'api_key', 'accessToken', 'access_token',
    'refreshToken', 'refresh_token', 'token', 'auth', 'authToken', 'auth_token',
    'privateKey', 'private_key', 'publicKey', 'public_key',
    'medicalRecordNumber', 'medical_record_number', 'mrn',
    'healthInsurance', 'health_insurance', 'insuranceNumber', 'insurance_number'
];
function isPIISecureModeEnabled() {
    if (typeof window !== "undefined") {
        return false;
    }
    var secret = (0, environmentUtil_1.tryGetEnvVar)('LOG_HASH_SECRET');
    return secret != null && secret.trim().length > 0 && nodeCrypto != null;
}
function hashPII(value) {
    if (value == null)
        return 'null';
    if (!nodeCrypto) {
        return '****';
    }
    var secret = (0, environmentUtil_1.tryGetEnvVar)('LOG_HASH_SECRET') || '';
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
function scanStringValueForPII(input) {
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
function eagerSanitizePII(obj) {
    if (obj == null)
        return obj;
    if (typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return eagerSanitizePII(item); });
    }
    var sanitized = {};
    var _loop_2 = function (key, value) {
        var lowerKey = key.toLowerCase();
        var keyWithoutUnderscore = lowerKey.startsWith('_') ? lowerKey.substring(1) : lowerKey;
        var isPIIField = PII_FIELDS.some(function (piiField) {
            var lowerPIIField = piiField.toLowerCase();
            return (lowerKey === lowerPIIField ||
                keyWithoutUnderscore === lowerPIIField ||
                lowerKey.includes(lowerPIIField) ||
                keyWithoutUnderscore.includes(lowerPIIField));
        });
        if (isPIIField && typeof value === 'string') {
            var obfuscated = (0, smartObfuscate_1.smartObfuscate)(value);
            if (isPIISecureModeEnabled() && value.length > 10) {
                var hash = hashPIIValue(value);
                obfuscated = "".concat(obfuscated, " (hashed=").concat(hash, ")");
            }
            sanitized[key] = obfuscated;
        }
        else if (isPIIField && value != null) {
            var stringValue = String(value);
            var obfuscated = (0, smartObfuscate_1.smartObfuscate)(stringValue);
            if (isPIISecureModeEnabled() && stringValue.length > 10) {
                var hash = hashPIIValue(stringValue);
                obfuscated = "".concat(obfuscated, " (hashed=").concat(hash, ")");
            }
            sanitized[key] = obfuscated;
        }
        else if (typeof value === 'string') {
            var scanned = scanStringValueForPII(value);
            sanitized[key] = scanned;
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = eagerSanitizePII(value);
        }
        else {
            sanitized[key] = value;
        }
    };
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        _loop_2(key, value);
    }
    return sanitized;
}
//# sourceMappingURL=piiSanitizer.js.map