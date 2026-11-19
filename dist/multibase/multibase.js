"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MULTIBASE_PREFIX_TABLE = void 0;
exports.encode = encode;
exports.decode = decode;
var ArgumentException_1 = require("../exception/ArgumentException");
exports.MULTIBASE_PREFIX_TABLE = [
    { codepoint: 'U+007a', prefix: 'z', name: 'base58btc', description: 'Base58 Bitcoin', status: 'final' },
    { codepoint: 'U+005a', prefix: 'Z', name: 'base58flickr', description: 'Base58 Flicker', status: 'experimental' },
    { codepoint: 'U+006d', prefix: 'm', name: 'base64', description: 'RFC4648 no padding', status: 'final' },
    { codepoint: 'U+004d', prefix: 'M', name: 'base64pad', description: 'RFC4648 with padding - MIME encoding', status: 'experimental' },
    { codepoint: 'U+0075', prefix: 'u', name: 'base64url', description: 'RFC4648 no padding', status: 'final' },
    { codepoint: 'U+0055', prefix: 'U', name: 'base64urlpad', description: 'RFC4648 with padding' },
];
var BASE64_RFC4648_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
var BASE58BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var BASE58FLICKR_ALPHABET = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
var SPECS = {
    base58btc: { kind: 'base58', alphabet: BASE58BTC_ALPHABET },
    base58flickr: { kind: 'base58', alphabet: BASE58FLICKR_ALPHABET },
    base64: { kind: 'base64', alphabet: BASE64_RFC4648_ALPHABET, padded: false },
    base64pad: { kind: 'base64', alphabet: BASE64_RFC4648_ALPHABET, padded: true },
    base64url: { kind: 'base64', alphabet: BASE64URL_ALPHABET, padded: false },
    base64urlpad: { kind: 'base64', alphabet: BASE64URL_ALPHABET, padded: true },
};
function prefixOf(name) {
    var row = exports.MULTIBASE_PREFIX_TABLE.find(function (r) { return r.name === name; });
    if (row === undefined) {
        throw new ArgumentException_1.ArgumentException("multibase: unknown encoding name");
    }
    return row.prefix;
}
function encode(bytes, name) {
    var spec = SPECS[name];
    if (spec === undefined) {
        throw new ArgumentException_1.ArgumentException("multibase: unknown encoding name");
    }
    var body = spec.kind === 'base64'
        ? encodeBase64Body(bytes, spec)
        : encodeBase58Body(bytes, spec.alphabet);
    return prefixOf(name) + body;
}
function decode(str) {
    if (str.length === 0) {
        throw new ArgumentException_1.ArgumentException('multibase: empty string has no prefix');
    }
    var prefix = str[0];
    var row = exports.MULTIBASE_PREFIX_TABLE.find(function (r) { return r.prefix === prefix; });
    if (row === undefined) {
        throw new ArgumentException_1.ArgumentException("multibase: unknown prefix U+".concat(prefix.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')));
    }
    var spec = SPECS[row.name];
    var bytes = spec.kind === 'base64'
        ? decodeBase64Body(str, spec, row.prefix)
        : decodeBase58Body(str, spec.alphabet, row.prefix);
    return { name: row.name, bytes: bytes };
}
function badChar(prefix, position, why) {
    return new ArgumentException_1.ArgumentException("multibase '".concat(prefix, "': ").concat(why, " at position ").concat(position));
}
function encodeBase64Body(bytes, spec) {
    var a = spec.alphabet;
    var out = '';
    var i = 0;
    for (; i + 2 < bytes.length; i += 3) {
        var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + a[(n >> 6) & 63] + a[n & 63];
    }
    var rest = bytes.length - i;
    if (rest === 1) {
        var n = bytes[i] << 16;
        out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + (spec.padded ? '==' : '');
    }
    else if (rest === 2) {
        var n = (bytes[i] << 16) | (bytes[i + 1] << 8);
        out += a[(n >> 18) & 63] + a[(n >> 12) & 63] + a[(n >> 6) & 63] + (spec.padded ? '=' : '');
    }
    return out;
}
function decodeBase64Body(str, spec, prefix) {
    var end = str.length;
    if (spec.padded) {
        while (end > 1 && str[end - 1] === '=') {
            end--;
        }
    }
    var padCount = str.length - end;
    var dataLen = end - 1;
    for (var p = 1; p < end; p++) {
        if (spec.alphabet.indexOf(str[p]) === -1) {
            throw badChar(prefix, p, str[p] === '=' ? 'padding where none is allowed' : 'character outside the alphabet');
        }
    }
    if (dataLen % 4 === 1) {
        throw new ArgumentException_1.ArgumentException("multibase '".concat(prefix, "': body length ").concat(dataLen, " is not a valid base64 length"));
    }
    if (spec.padded) {
        var expectedPad = (4 - (dataLen % 4)) % 4;
        if (padCount !== expectedPad) {
            throw new ArgumentException_1.ArgumentException("multibase '".concat(prefix, "': expected ").concat(expectedPad, " padding characters, found ").concat(padCount));
        }
    }
    var out = new Uint8Array(Math.floor((dataLen * 6) / 8));
    var acc = 0;
    var bits = 0;
    var o = 0;
    for (var p = 1; p < end; p++) {
        acc = ((acc << 6) | spec.alphabet.indexOf(str[p])) & 0xffff;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out[o++] = (acc >> bits) & 0xff;
        }
    }
    if ((acc & ((1 << bits) - 1)) !== 0) {
        throw badChar(prefix, end - 1, 'non-zero unused trailing bits in the final character');
    }
    return out;
}
function encodeBase58Body(bytes, alphabet) {
    var zeros = 0;
    while (zeros < bytes.length && bytes[zeros] === 0) {
        zeros++;
    }
    var digits = [];
    for (var i = zeros; i < bytes.length; i++) {
        var carry = bytes[i];
        for (var j = 0; j < digits.length; j++) {
            carry += digits[j] * 256;
            digits[j] = carry % 58;
            carry = Math.floor(carry / 58);
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }
    var out = alphabet[0].repeat(zeros);
    for (var j = digits.length - 1; j >= 0; j--) {
        out += alphabet[digits[j]];
    }
    return out;
}
function decodeBase58Body(str, alphabet, prefix) {
    var values = [];
    for (var p = 1; p < str.length; p++) {
        var v = alphabet.indexOf(str[p]);
        if (v === -1) {
            throw badChar(prefix, p, 'character outside the alphabet');
        }
        values.push(v);
    }
    var zeros = 0;
    while (zeros < values.length && values[zeros] === 0) {
        zeros++;
    }
    var bytes = [];
    for (var i = zeros; i < values.length; i++) {
        var carry = values[i];
        for (var j = 0; j < bytes.length; j++) {
            carry += bytes[j] * 58;
            bytes[j] = carry & 0xff;
            carry >>= 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    var out = new Uint8Array(zeros + bytes.length);
    for (var j = 0; j < bytes.length; j++) {
        out[out.length - 1 - j] = bytes[j];
    }
    return out;
}
//# sourceMappingURL=multibase.js.map