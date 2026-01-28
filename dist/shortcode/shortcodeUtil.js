"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALPHABET_56 = exports.ALPHABET_58 = void 0;
exports.generateShortCode58 = generateShortCode58;
exports.generateShortCode56 = generateShortCode56;
exports.normalizeShortCode58 = normalizeShortCode58;
exports.calculateCombinations = calculateCombinations;
exports.ALPHABET_58 = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
exports.ALPHABET_56 = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
function generateShortCode58(length) {
    if (length === void 0) { length = 8; }
    var code = '';
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * exports.ALPHABET_58.length);
        code += exports.ALPHABET_58[randomIndex];
    }
    return code;
}
function generateShortCode56(length) {
    if (length === void 0) { length = 8; }
    var code = '';
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * exports.ALPHABET_56.length);
        code += exports.ALPHABET_56[randomIndex];
    }
    return code;
}
function normalizeShortCode58(shortCode) {
    return shortCode
        .replace(/[Oo]/g, '0')
        .replace(/[lI]/g, '1');
}
function calculateCombinations(alphabetSize, length) {
    return Math.pow(alphabetSize, length);
}
//# sourceMappingURL=shortcodeUtil.js.map