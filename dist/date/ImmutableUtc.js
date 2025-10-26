"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmutableUtc = void 0;
exports.ImmutableUtc = {
    fromDate: function (date) {
        if (!(date instanceof Date)) {
            throw new Error('ImmutableUtc.fromDate() requires a Date object');
        }
        if (isNaN(date.getTime())) {
            throw new Error('ImmutableUtc.fromDate() received an invalid Date');
        }
        return date.toISOString();
    },
    now: function () {
        return new Date().toISOString();
    },
    parse: function (dateString) {
        if (typeof dateString !== 'string') {
            throw new Error('ImmutableUtc.parse() requires a string');
        }
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("ImmutableUtc.parse() received an invalid date string: ".concat(dateString));
        }
        return date;
    },
    toDate: function (immutableUtc) {
        return exports.ImmutableUtc.parse(immutableUtc);
    },
    fromMillis: function (timestamp) {
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            throw new Error('ImmutableUtc.fromMillis() requires a valid number');
        }
        return exports.ImmutableUtc.fromDate(new Date(timestamp));
    },
    toMillis: function (immutableUtc) {
        return exports.ImmutableUtc.toDate(immutableUtc).getTime();
    },
    fromSeconds: function (timestamp) {
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            throw new Error('ImmutableUtc.fromSeconds() requires a valid number');
        }
        return exports.ImmutableUtc.fromMillis(timestamp * 1000);
    },
    toSeconds: function (immutableUtc) {
        return Math.floor(exports.ImmutableUtc.toMillis(immutableUtc) / 1000);
    },
    isValid: function (value) {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            var date = new Date(value);
            return !isNaN(date.getTime()) && date.toISOString() === value;
        }
        catch (_a) {
            return false;
        }
    },
    compare: function (a, b) {
        return exports.ImmutableUtc.toMillis(a) - exports.ImmutableUtc.toMillis(b);
    },
    min: function (a, b) {
        return exports.ImmutableUtc.compare(a, b) <= 0 ? a : b;
    },
    max: function (a, b) {
        return exports.ImmutableUtc.compare(a, b) >= 0 ? a : b;
    }
};
//# sourceMappingURL=ImmutableUtc.js.map