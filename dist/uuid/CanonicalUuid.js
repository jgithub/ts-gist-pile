"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalUuid = void 0;
var stringUtil_1 = require("../string/stringUtil");
var uuid_1 = require("uuid");
var multibase_1 = require("../multibase/multibase");
var ArgumentException_1 = require("../exception/ArgumentException");
exports.CanonicalUuid = {
    fromString: function (uuid) {
        if (typeof uuid !== 'string') {
            throw new Error('CanonicalUuid.fromString() requires a string');
        }
        var normalized = uuid.toLowerCase().trim();
        if (!(0, stringUtil_1.isWellFormedCanonicalUuid)(normalized)) {
            throw new Error("CanonicalUuid.fromString() received an invalid UUID: ".concat(uuid));
        }
        return normalized;
    },
    toMultibase: function (uuid, name) {
        if (name === void 0) { name = 'base64url'; }
        var hex = exports.CanonicalUuid.fromString(uuid).replace(/-/g, '');
        var bytes = new Uint8Array(16);
        for (var i = 0; i < 16; i++) {
            bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return (0, multibase_1.encode)(bytes, name);
    },
    fromMultibase: function (str) {
        var bytes = (0, multibase_1.decode)(str).bytes;
        if (bytes.length !== 16) {
            throw new ArgumentException_1.ArgumentException("CanonicalUuid.fromMultibase() needs exactly 16 bytes, got ".concat(bytes.length));
        }
        var hex = '';
        for (var i = 0; i < 16; i++) {
            hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
        }
        return exports.CanonicalUuid.fromString("".concat(hex.slice(0, 8), "-").concat(hex.slice(8, 12), "-").concat(hex.slice(12, 16), "-").concat(hex.slice(16, 20), "-").concat(hex.slice(20)));
    },
    parse: function (uuid) {
        return exports.CanonicalUuid.fromString(uuid);
    },
    v4: function () {
        return (0, uuid_1.v4)().toLowerCase();
    },
    v7: function () {
        return (0, uuid_1.v7)().toLowerCase();
    },
    toString: function (uuid) {
        return uuid;
    },
    isValid: function (value) {
        if (typeof value !== 'string') {
            return false;
        }
        return (0, stringUtil_1.isWellFormedCanonicalUuid)(value);
    },
    compare: function (a, b) {
        return a.localeCompare(b);
    },
    min: function (a, b) {
        return exports.CanonicalUuid.compare(a, b) <= 0 ? a : b;
    },
    max: function (a, b) {
        return exports.CanonicalUuid.compare(a, b) >= 0 ? a : b;
    },
    getVersion: function (uuid) {
        var versionChar = uuid.charAt(14);
        return parseInt(versionChar, 16);
    },
    isV7: function (uuid) {
        return exports.CanonicalUuid.getVersion(uuid) === 7;
    },
    isV4: function (uuid) {
        return exports.CanonicalUuid.getVersion(uuid) === 4;
    }
};
//# sourceMappingURL=CanonicalUuid.js.map