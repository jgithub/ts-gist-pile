"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalUuid = void 0;
var stringUtil_1 = require("../string/stringUtil");
var uuid_1 = require("uuid");
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