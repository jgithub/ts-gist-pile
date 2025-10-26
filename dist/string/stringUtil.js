"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPresent = isPresent;
exports.isEmpty = isEmpty;
exports.isBlank = isBlank;
exports.isWellFormedCanonicalUuid = isWellFormedCanonicalUuid;
exports.padLeftWithZeros = padLeftWithZeros;
exports.tryRemoveTrailingSlashesIfPresent = tryRemoveTrailingSlashesIfPresent;
exports.tryRemoveDoubleSlashesIfPresent = tryRemoveDoubleSlashesIfPresent;
function isPresent(input) {
    if (input == null) {
        return false;
    }
    if (typeof input === 'string') {
        if (input.trim().length > 0) {
            return true;
        }
    }
    return false;
}
function isEmpty(input) {
    if (input == null) {
        return true;
    }
    if (typeof input === 'string') {
        if (input.length === 0) {
            return true;
        }
    }
    return false;
}
function isBlank(input) {
    if (input == null) {
        return true;
    }
    if (typeof input === 'string') {
        if (input.length >= 0 && input.trim().length === 0) {
            return true;
        }
    }
    return false;
}
function isWellFormedCanonicalUuid(input) {
    if (input == null) {
        return false;
    }
    if (typeof input === 'string') {
        var regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-7][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (input.toLowerCase().match(regexp)) {
            return true;
        }
    }
    return false;
}
function padLeftWithZeros(input, notLessThanXDigits) {
    var workingValue = input.toString();
    while (workingValue.length < notLessThanXDigits) {
        workingValue = "0" + workingValue;
    }
    return workingValue;
}
function tryRemoveTrailingSlashesIfPresent(input) {
    if (input == null) {
        return input;
    }
    while (input.endsWith("\/")) {
        input = input.replace(/\/$/g, "");
    }
    return input;
}
function tryRemoveDoubleSlashesIfPresent(input, opt) {
    if (input == null) {
        return input;
    }
    while (input.match(/\/\//)) {
        input = input.replace(/\/\//g, "/");
    }
    if (opt === null || opt === void 0 ? void 0 : opt.butTryToBeSmartAboutUrls) {
        input = input.replace(/^https:\//, "https://");
        input = input.replace(/^http:\//, "http://");
        input = input.replace(/^ftp:\//, "ftp://");
    }
    return input;
}
//# sourceMappingURL=stringUtil.js.map