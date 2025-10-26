"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValue = hasValue;
exports.isNullish = isNullish;
function hasValue(input) {
    if (typeof input === 'undefined' || input === null) {
        return false;
    }
    return true;
}
function isNullish(input) {
    if (typeof input === 'undefined' || input === null) {
        return true;
    }
    return false;
}
//# sourceMappingURL=anyUtil.js.map