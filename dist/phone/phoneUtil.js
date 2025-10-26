"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
function normalizePhone(phone) {
    if (!phone || phone.trim().length === 0) {
        throw new Error('Phone number cannot be empty');
    }
    var normalized = phone.replace(/[\s\-\(\)\.\[\]]/g, '');
    var hasPlus = normalized.startsWith('+');
    var digits = normalized.replace(/\D/g, '');
    if (hasPlus) {
        normalized = '+' + digits;
    }
    else {
        if (digits.length === 10) {
            normalized = '+1' + digits;
        }
        else if (digits.length === 11 && digits.startsWith('1')) {
            normalized = '+' + digits;
        }
        else if (digits.length >= 7 && digits.length <= 15) {
            throw new Error("Phone number must include country code (use +): ".concat(phone));
        }
        else {
            throw new Error("Invalid phone number length: ".concat(phone));
        }
    }
    if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
        throw new Error("Invalid E.164 format: ".concat(normalized, " (from: ").concat(phone, ")"));
    }
    return normalized;
}
//# sourceMappingURL=phoneUtil.js.map