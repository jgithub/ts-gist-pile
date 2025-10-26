"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeNumberAsBase62 = encodeNumberAsBase62;
exports.decodeBase62ToNumber = decodeBase62ToNumber;
exports.convertHexToBase62 = convertHexToBase62;
exports.convertHexToNanoIdAlphabet = convertHexToNanoIdAlphabet;
var BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var BASE64_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
var NANOID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';
var NOLOOKALIKES_ALPHABET = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz';
function encodeNumberAsBase62(num) {
    if (num === 0)
        return '0';
    if (num < 0) {
        throw new Error("Cannot encode negative numbers");
    }
    var result = '';
    while (num > 0) {
        result = BASE62_ALPHABET[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}
var BASE62_CHAR_MAP = Object.fromEntries(BASE62_ALPHABET.split('').map(function (char, i) { return [char, i]; }));
function decodeBase62ToNumber(str) {
    var result = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str[i];
        var value = BASE62_CHAR_MAP[char];
        if (typeof value === 'undefined') {
            throw new Error("Invalid base62 character: ".concat(char));
        }
        result = result * 62 + value;
    }
    return result;
}
function convertHexToBase62(hex) {
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
        throw new Error('Invalid hex input');
    }
    var decimal = '0';
    for (var i = 0; i < hex.length; i++) {
        var digit = parseInt(hex[i], 16);
        decimal = multiplyDecimalStringByInt(decimal, 16);
        decimal = addDecimalStrings(decimal, digit.toString());
    }
    if (decimal === '0')
        return '0';
    var result = '';
    while (decimal !== '0') {
        var _a = divideDecimalStringByInt(decimal, 62), quotient = _a.quotient, remainder = _a.remainder;
        result = BASE62_ALPHABET[parseInt(remainder, 10)] + result;
        decimal = quotient;
    }
    return result;
}
function convertHexToNanoIdAlphabet(hex) {
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
        throw new Error('Invalid hex input');
    }
    var decimal = '0';
    for (var i = 0; i < hex.length; i++) {
        var digit = parseInt(hex[i], 16);
        decimal = multiplyDecimalStringByInt(decimal, 16);
        decimal = addDecimalStrings(decimal, digit.toString());
    }
    if (decimal === '0')
        return '0';
    var result = '';
    while (decimal !== '0') {
        var _a = divideDecimalStringByInt(decimal, 64), quotient = _a.quotient, remainder = _a.remainder;
        result = NANOID_ALPHABET[parseInt(remainder, 10)] + result;
        decimal = quotient;
    }
    return result;
}
function multiplyDecimalStringByInt(decimal, multiplier) {
    var carry = 0;
    var result = '';
    for (var i = decimal.length - 1; i >= 0; i--) {
        var product = parseInt(decimal[i], 10) * multiplier + carry;
        result = (product % 10).toString() + result;
        carry = Math.floor(product / 10);
    }
    if (carry > 0) {
        result = carry.toString() + result;
    }
    return result;
}
function addDecimalStrings(a, b) {
    var result = '';
    var carry = 0;
    var i = a.length - 1;
    var j = b.length - 1;
    while (i >= 0 || j >= 0 || carry > 0) {
        var digitA = i >= 0 ? parseInt(a[i--], 10) : 0;
        var digitB = j >= 0 ? parseInt(b[j--], 10) : 0;
        var sum = digitA + digitB + carry;
        result = (sum % 10).toString() + result;
        carry = Math.floor(sum / 10);
    }
    return result;
}
function divideDecimalStringByInt(decimal, divisor) {
    var quotient = '';
    var remainder = 0;
    for (var i = 0; i < decimal.length; i++) {
        var digit = parseInt(decimal[i], 10);
        var accumulator = remainder * 10 + digit;
        var q = Math.floor(accumulator / divisor);
        remainder = accumulator % divisor;
        if (quotient !== '' || q > 0) {
            quotient += q.toString();
        }
    }
    return {
        quotient: quotient || '0',
        remainder: remainder.toString(),
    };
}
//# sourceMappingURL=radixUtil.js.map