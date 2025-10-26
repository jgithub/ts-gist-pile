"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSortedFiveMinuteBucketsForYearInSeconds = generateSortedFiveMinuteBucketsForYearInSeconds;
exports.dateToYyyyMmDdStringAtUtc = dateToYyyyMmDdStringAtUtc;
exports.getDateInLondon = getDateInLondon;
exports.getMillisecondsBetweenDates = getMillisecondsBetweenDates;
exports.getSecondsBetweenDates = getSecondsBetweenDates;
exports.getSecondsBetweenEpochAndDate = getSecondsBetweenEpochAndDate;
exports.getMillisecondsBetweenEpochAndDate = getMillisecondsBetweenEpochAndDate;
exports.isValidDateObject = isValidDateObject;
exports.isIso8601 = isIso8601;
exports.isIso8601Utc = isIso8601Utc;
function generateSortedFiveMinuteBucketsForYearInSeconds(year) {
    var firstMomentOfYear = Date.UTC(year, 0, 0, 0, 0, 0);
    var firstMomentOfNextYear = Date.UTC(year + 1, 0, 0, 0, 0, 0);
    var retval = [];
    var workingValueInMilliseconds = firstMomentOfYear;
    while (workingValueInMilliseconds < firstMomentOfNextYear) {
        retval.push(workingValueInMilliseconds / 1000);
        workingValueInMilliseconds += (5 * 60 * 1000);
    }
    return retval;
}
function dateToYyyyMmDdStringAtUtc(date) {
    var dateAtUtc = new Date(date.toUTCString());
    var yyyyMmDdString = "".concat(dateAtUtc.getUTCFullYear()).concat(padLeftWithZeros(dateAtUtc.getUTCMonth() + 1, 2)).concat(padLeftWithZeros(dateAtUtc.getUTCDate(), 2));
    return yyyyMmDdString;
}
function getDateInLondon(date) {
    var dateAtUtc = new Date(date.toUTCString());
    return dateAtUtc;
}
function padLeftWithZeros(input, notLessThanXDigits) {
    var workingValue = input.toString();
    while (workingValue.length < notLessThanXDigits) {
        workingValue = "0" + workingValue;
    }
    return workingValue;
}
function getMillisecondsBetweenDates(start, end) {
    return end.getTime() - start.getTime();
}
function getSecondsBetweenDates(start, end) {
    return Math.floor((end.getTime() - start.getTime()) / 1000);
}
function getSecondsBetweenEpochAndDate(date) {
    return Math.floor(date.getTime() / 1000);
}
function getMillisecondsBetweenEpochAndDate(date) {
    return date.getTime();
}
function isValidDateObject(obj) {
    return !!(obj && Object.prototype.toString.call(obj) === "[object Date]" && !isNaN(obj));
}
function isIso8601(input) {
    if (typeof input !== 'string') {
        return false;
    }
    return (new Date(input)).toISOString() === input;
}
function isIso8601Utc(input) {
    if (typeof input !== 'string') {
        return false;
    }
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(input))
        return false;
    var d = new Date(input);
    return !isNaN(d.getTime()) && d.toISOString() === input;
}
//# sourceMappingURL=dateUtil.js.map