"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartObfuscate = smartObfuscate;
function smartObfuscate(input) {
    var len = input.length;
    if (/^\d{15,16}$/.test(input)) {
        return "****".concat(input.substring(len - 4));
    }
    if (/^[\d\s\-]{15,19}$/.test(input) && /\d{4}/.test(input.substring(len - 4))) {
        return "****".concat(input.substring(len - 4));
    }
    if (/^\d{3}-\d{2}-\d{4}$/.test(input)) {
        return "****".concat(input.substring(len - 4));
    }
    if (/^\+?[\d\s\-()]{10,}$/.test(input)) {
        var digits = input.replace(/\D/g, '');
        if (digits.length >= 10) {
            return "****".concat(input.substring(len - 4));
        }
    }
    if (input.includes('@') && input.includes('.') && /^[a-zA-Z0-9]/.test(input)) {
        var parts = input.split('@');
        if (parts.length === 2 && parts[0].length > 0 && /^[a-zA-Z0-9]/.test(parts[1])) {
            var local = parts[0];
            var domain = parts[1];
            if (local.length <= 2) {
                return "****@".concat(domain);
            }
            return "".concat(local.substring(0, 2), "****@").concat(domain);
        }
    }
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(input)) {
        var words = input.split(' ');
        return "".concat(words[0].substring(0, 2), "**** ").concat(words[words.length - 1].substring(0, 2), "****");
    }
    if (len > 36)
        return "****".concat(input.substring(len - 6));
    if (len > 26)
        return "****".concat(input.substring(len - 5));
    if (len > 16)
        return "****".concat(input.substring(len - 4));
    if (len > 10)
        return "****".concat(input.substring(len - 2));
    return "****";
}
//# sourceMappingURL=smartObfuscate.js.map